require('dotenv').config()
require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers')
const waitL2Tx = require('./scripts/waitL2Tx.js')
const { hardhatConfig } = require('arb-shared-dependencies')

module.exports = hardhatConfig
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('waitL2Tx', "Prints an account's balance")
  .addParam('txhash', 'Hash of txn that triggered and L2 to L1 message')

  .setAction(async args => {
    await waitL2Tx(args.txhash)
  })


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
};
