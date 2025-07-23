const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ethers = hre.ethers;
  const userContractAddress = process.env.NEXT_PUBLIC_CONTRACT_USER_REGISTRATION;
  const productContractAddress = process.env.NEXT_PUBLIC_CONTRACT_PRODUCT_REGISTRATION;

  if (!userContractAddress) {
    throw new Error("Por favor define CONTRACT_USER_REGISTRATION en tu .env");
  }
  if (!productContractAddress) {
    throw new Error("Por favor define CONTRACT_PRODUCT_REGISTRATION en tu .env");
  }

  console.log("Desplegando SalesContract con:");
  console.log("  UserRegistrationContract:", userContractAddress);
  console.log("  ProductRegistrationContract:", productContractAddress);

  const SalesFactory = await ethers.getContractFactory("SalesContract");
  const salesContract = await SalesFactory.deploy(userContractAddress, productContractAddress);

  await salesContract.deployed();

  console.log("SalesContract desplegado en:", salesContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
