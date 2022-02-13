const hre = require('hardhat')
const ethers = require('ethers')
const { Bridge , OutgoingMessageState } = require('arb-ts')
const { hexDataLength } = require('@ethersproject/bytes')
const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')
requireEnvVariables(['DEVNET_PRIVKEY', 'L2RPC', 'L1RPC', "INBOX_ADDR"])

/**
 * Instantiate wallets and providers for bridge
 */

const walletPrivateKey = process.env.DEVNET_PRIVKEY
console.log("RPC :"+process.env.L1RPC + "   RPC:" + process.env.L2RPC )
const l1Provider = new ethers.providers.JsonRpcProvider(process.env.L1RPC)
const l2Provider = new ethers.providers.JsonRpcProvider(process.env.L2RPC)
const walletMnemonic = ethers.Wallet.fromMnemonic(walletPrivateKey)
const signer = new ethers.Wallet(walletMnemonic.privateKey)

const l1Signer = signer.connect(l1Provider)
const l2Signer = signer.connect(l2Provider)


const main = async () => {

    const l1Balance = await l1Signer.getBalance()
    const l2Balance = await l2Signer.getBalance()
    console.log("L1 Eth Balance:" + l1Balance)
    console.log("L2 Eth Balance:" + l2Balance)

    await arbLog('Cross-chain Greeter')
    /**
     * Use wallets to create an arb-ts bridge instance to use its convenience methods
     */
    const bridge = await Bridge.init(l1Signer, l2Signer)

////////////////////////////////////////////Deploying L2 Greeter and L1 Greeter /////////////////////////////////////////////
    const L1Greeter = await (
        await hre.ethers.getContractFactory('GreeterL1')
      ).connect(l1Signer) //
      console.log('Deploying L1 Greeter 👋')
      const l1Greeter = await L1Greeter.connect(l1Signer).deploy(
        'Hello world in L1',
        ethers.constants.AddressZero, // temp l2 addr
        process.env.INBOX_ADDR
      )
      await l1Greeter.deployed()
      console.log(`deployed to ${l1Greeter.address}`)
    
    
      
      const L2Greeter =  await hre.ethers.getContractFactory('GreeterL2')
    
      console.log('Deploying L2 Greeter 👋👋' )
    
    
      const l2Greeter = await L2Greeter.connect(l2Signer).deploy(
        'Hello world in L2',
        ethers.constants.AddressZero // temp l1 addr
      )
    
      await l2Greeter.deployed()
      console.log(`deployed to ${l2Greeter.address}`)
    
      
      const updateL1Tx = await l1Greeter.updateL2Target(l2Greeter.address)
      await updateL1Tx.wait()
    
      const updateL2Tx = await l2Greeter.updateL1Target(l1Greeter.address)
      await updateL2Tx.wait()
      console.log('Counterpart contract addresses set in both greeters 👍')
    

      const currentL1Greeting = await l1Greeter.greet()
      console.log(`Current L2 greeting: "${currentL1Greeting}"`)

      const newL1Greeting = "greeting sccceed set in L1 from L2 ! instersting rollup"
      const setGreetingInL1Tx =  await l2Greeter.setGreetingInL1(newL1Greeting)
      const setGreetingInL1Receipt = await setGreetingInL1Tx.wait()
      console.log(`l2Greeter.setGreetingInL1 TxHash : ${setGreetingInL1Receipt.transactionHash}  FromAddr:${setGreetingInL1Receipt.from}`)

    //   const initiatingTxnReceipt = await bridge.l2Provider.getTransactionReceipt(
    //     setGreetingInL1Receipt.transactionHash
    //   )

    //  if (!initiatingTxnReceipt)
    //     throw new Error(
    //     `No Arbitrum transaction found with provided txn hash: ${txnHash}`
    //   )




    // 监听L2 events logs，如果某个二层交易需要与一层交互，会emit L2ToL1Transaction      
    // 入参:l2 tx receipt 
    /* event detail: 
                ArbSys.sol
                event L2ToL1Transaction(address caller, address indexed destination, uint indexed uniqueId,
                            uint indexed batchNumber, uint indexInBatch,
                            uint arbBlockNum, uint ethBlockNum, uint timestamp,
                            uint callvalue, bytes data);

    */
    /**
     * In order to trigger the outbox message, we'll first need the outgoing messages batch number and index; together these two things uniquely identify an outgoing message.
     * To get this data, we'll use getWithdrawalsInL2Transaction, which retrieves this data from the L2 events logs
     */
    // const outGoingMessagesFromTxn = await bridge.getWithdrawalsInL2Transaction(
    //     initiatingTxnReceipt
    // )

    // if (outGoingMessagesFromTxn.length === 0)
    //     throw new Error(`Txn ${txnHash} did not initiate an outgoing messages`)

    // /**
    //  * Note that in principle, a single transaction could trigger any number of outgoing messages; the common case will be there's only one.
    //  * For the sake of this script, we assume there's only one / just grad the first one.
    //  */
    // const { batchNumber, indexInBatch } = outGoingMessagesFromTxn[0]

    // /**
    //  * We've got batchNumber and IndexInBatch in hand; but before we try to execute out message, we need to make sure it's confirmed! (It can only be confirmed after the dispute period; Arbitrum is an optimistic rollup after-all)
    //  * Here we'll do a period check; once getOutGoingMessageState tells us our txn is confirm, we'll move on to execution
    //  */
    // // 通过 batchNumber 和 indexInBatch获取交易状态
    // const outgoingMessageState = await bridge.getOutGoingMessageState(
    //     batchNumber,
    //     indexInBatch
    // )

    // console.log(
    //     `Waiting for message to be confirmed: Batchnumber: ${batchNumber}, IndexInBatch ${indexInBatch}`
    // )
    // console.log(`Outgoing message state: ${OutgoingMessageState[outgoingMessageState]}`)

//     const timeToWaitMs = 1000 * 60
//     while (outgoingMessageState !== OutgoingMessageState.CONFIRMED) {
//         console.log(`Message not yet confirmed; we'll wait ${timeToWaitMs / 1000} seconds and try again`)
//         await wait(timeToWaitMs)
//         const outgoingMessageState = await bridge.getOutGoingMessageState(
//         batchNumber,
//         indexInBatch
//         )

//         switch (outgoingMessageState) {
//             case OutgoingMessageState.NOT_FOUND: {
//                 console.log('Message not found; something strange and bad happened')
//                 process.exit(1)
//                 break
//             }
//             case OutgoingMessageState.EXECUTED: {
//                 console.log(`Message already executed! Nothing else to do here`)
//                 process.exit(1)
//                 break
//             }
//             case OutgoingMessageState.UNCONFIRMED: {
//                 break
//             }

//             default:
//                 break
//             }
//         }

//   console.log('Transaction confirmed! Trying to execute now')
//   /**
//    * Now that its confirmed, we can retrieve the Merkle proof data from the chain, and execute our message in its outbox entry.
//    * triggerL2ToL1Transaction handles these steps
//    */
//   const res = await bridge.triggerL2ToL1Transaction(batchNumber, indexInBatch)
//   const rec = await res.wait()

//   console.log('Done! Your transaction is executed', rec)


}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
