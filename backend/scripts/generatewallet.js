// scripts/generate-wallet.js
const { ethers } = require("hardhat");

async function main() {
  const wallet = ethers.Wallet.createRandom();
  console.log("Dirección:", wallet.address);
  console.log("Private Key:", wallet.privateKey);
  console.log("Mnemonic:", wallet.mnemonic.phrase);
}

main();
