// scripts/deployShipmentRegistration.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying ShipmentRegistrationContract…");

  // Obtenemos la fábrica para ShipmentRegistrationContract
  const Factory = await hre.ethers.getContractFactory("ShipmentRegistrationContract");

  // Desplegamos sin parámetros de constructor
  const contract = await Factory.deploy();
  await contract.deployed();

  console.log("✅ ShipmentRegistrationContract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
