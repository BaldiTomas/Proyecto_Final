require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!RPC_URL) {
  throw new Error("Define RPC_URL en tu .env");
}
if (!PRIVATE_KEY) {
  throw new Error("Define PRIVATE_KEY en tu .env");
}

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20" },
      { version: "0.8.19" }
    ]
  },
  networks: {
    sepolia: {
      url: RPC_URL,
      accounts: [`0x${PRIVATE_KEY.replace(/^0x/, "")}`],
      maxFeePerGas: 30_000_000_000,      
      maxPriorityFeePerGas: 10_000_000_000,
    },
  },
};
