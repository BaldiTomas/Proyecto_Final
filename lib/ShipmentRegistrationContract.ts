// lib/ShipmentRegistrationContract.ts
import { ethers } from "ethers"
import ShipmentJSON from "./ShipmentRegistrationContractABI.json"

const address = process.env.NEXT_PUBLIC_CONTRACT_SHIPMENT_REGISTRATION!
if (!address) throw new Error("Missing NEXT_PUBLIC_CONTRACT_SHIPMENT_REGISTRATION")

const abi = (ShipmentJSON as any).abi as ethers.ContractInterface

export function getShipmentContract() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 provider found")
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer   = provider.getSigner()
  return new ethers.Contract(address, abi, signer)
}
