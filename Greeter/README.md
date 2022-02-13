# Installation
npm install

# run 
## l1 contract call  l2 contract method
npx hardhat run ./scripts/L1ToL2.js

## l2 contract call l1 contract method
```
npx hardhat run ./scripts/L2ToL1.js
```

将上一步执行之后获得的txhash填写到下面--txhash之后
```
npx hardhat waitL2Tx --txhash 0xe9ff7423865ef8df3b4378a2a3ef702eea69e5b7848b0604df3dfd49734855e9
```
