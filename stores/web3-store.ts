import { create } from "zustand"
import type { ethers } from "ethers"

interface Web3State {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  account: string | null
  chainId: number | null
  isConnected: boolean
  walletAddress: string | null
  setProvider: (provider: ethers.BrowserProvider) => void
  setSigner: (signer: ethers.JsonRpcSigner) => void
  setAccount: (account: string) => void
  setChainId: (chainId: number) => void
  setConnected: (connected: boolean) => void
  disconnect: () => void
  isWalletConnected: () => boolean
}

export const useWeb3Store = create<Web3State>((set, get) => ({
  provider: null,
  signer: null,
  walletAddress: null,
  account: null,
  chainId: null,
  isConnected: false,
  setProvider: (provider) => set({ provider }),
  setSigner: (signer) => set({ signer }),
  setAccount: (account) => set({ account }),
  setChainId: (chainId) => set({ chainId }),
  setConnected: (isConnected) => set({ isConnected }),
  disconnect: () =>
    set({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      isConnected: false,
    }),
    isWalletConnected: () => {
    const { walletAddress, isConnected } = get();
    return !!walletAddress && isConnected;
  },
}))
