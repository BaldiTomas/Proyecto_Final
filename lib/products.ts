import { ethers } from 'ethers';
import ProductRegistrationABI from './ProductRegistrationABI.json';
const CONTRACT_ADDRESS = '0x0246A54019C63471A83C408402CB7ed6c93e003a';

export async function registerProductOnChain(name: string, metadataHash: string): Promise<number> {
  if (!window.ethereum) throw new Error('Wallet no detectada');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ProductRegistrationABI.abi, signer);
  const tx = await contract.registerProduct(name, metadataHash);
  const receipt = await tx.wait();
  const event = receipt.events?.find((e: any) => e.event === 'ProductRegistered');
  return event?.args.productId.toNumber();
}

export async function updateProductOnChain(id: number, name: string, metadataHash: string): Promise<void> {
  if (!window.ethereum) throw new Error('Wallet no detectada');
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ProductRegistrationABI.abi, signer);
  const tx = await contract.updateProduct(id, name, metadataHash);
  await tx.wait();
}

export function generateMetadataHash(data: any): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(data)));
}