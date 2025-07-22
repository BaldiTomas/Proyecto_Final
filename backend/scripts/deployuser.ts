const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ethers = hre.ethers;

  // Tomar las addresses del .env
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

  // Obtener el factory del contrato
  const SalesFactory = await ethers.getContractFactory("SalesContract");
  // Deploy con las addresses del user y product contract
  const salesContract = await SalesFactory.deploy(userContractAddress, productContractAddress);

  await salesContract.deployed();

  console.log("SalesContract desplegado en:", salesContract.address);

  // OPCIONAL: Guardar la address del SalesContract en .env automáticamente
  // (requiere un package externo como 'fs' para editar el archivo, preguntame si lo querés hacer!)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
