import { ethers } from "ethers";
import UserRegistrationABI from "./UserRegistrationABI.json";
import ProductRegistrationABI from "./ProductRegistrationABI.json";
import SalesABI from "./SalesABI.json";

declare global {
  interface Window { ethereum?: any }
}

function getSigner() {
  if (!window.ethereum) throw new Error("Wallet no detectada");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getSigner();
}

const USER_REG_ADDRESS     = process.env.NEXT_PUBLIC_CONTRACT_USER_REGISTRATION!;
const PRODUCT_REG_ADDRESS  = process.env.NEXT_PUBLIC_CONTRACT_PRODUCT_REGISTRATION!;
const SALES_ADDRESS        = process.env.NEXT_PUBLIC_CONTRACT_SALE_TRANSACTION!;

if (!USER_REG_ADDRESS)    throw new Error("Define NEXT_PUBLIC_CONTRACT_USER_REGISTRATION en tu .env.local");
if (!PRODUCT_REG_ADDRESS) throw new Error("Define NEXT_PUBLIC_CONTRACT_PRODUCT_REGISTRATION en tu .env.local");
if (!SALES_ADDRESS)       throw new Error("Define NEXT_PUBLIC_CONTRACT_SALE_TRANSACTION en tu .env.local");

type SaleArgs = {
  productId: number;
  toCustodyId: number;
  quantity: number;
  price: number;
};

export async function registerUserOnChain(
  userAddress: string,
  name: string,
  email: string
) {
  const signer = getSigner();
  const contract = new ethers.Contract(
    USER_REG_ADDRESS,
    UserRegistrationABI.abi,
    signer
  );
  const tx = await contract.registerUser(userAddress, name, email);
  await tx.wait();
}

export async function registerProductOnChain(
  name: string,
  metadataHash: string,
  initialCustodyId: number
): Promise<string> {
  const signer = getSigner();
  const contract = new ethers.Contract(
    PRODUCT_REG_ADDRESS,
    ProductRegistrationABI.abi,
    signer
  );
  const tx = await contract.registerProduct(
    name,
    metadataHash,
    initialCustodyId
  );
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

export function generateMetadataHash(data: any): string {
  return ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(data))
  );
}

export async function updateProductOnChain(
  productId: number,
  name: string,
  metadataHash: string
) {
  const signer = getSigner();
  const contract = new ethers.Contract(
    PRODUCT_REG_ADDRESS,
    ProductRegistrationABI.abi,
    signer
  );
  const tx = await contract.updateProduct(productId, name, metadataHash);
  await tx.wait();
}

export async function registerSaleOnChain({
  productId,
  toCustodyId,
  quantity,
  price,
}: SaleArgs) {
  if (!window.ethereum) throw new Error("MetaMask no detectado");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(
    SALES_ADDRESS,
    SalesABI.abi,
    signer
  );
  const tx = await contract.sellProduct(
    productId,
    toCustodyId,
    quantity,
    ethers.utils.parseUnits(price.toString(), 18)
  );
  return tx.wait();
}

export const buyProductOnChain = registerSaleOnChain;
