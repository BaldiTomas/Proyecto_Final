"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { useWeb3Store } from "@/stores/web3-store"
import { toast } from "sonner"

interface Web3ContextType {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const { setProvider, setSigner, setAccount, setConnected, setChainId, disconnect } = useWeb3Store()

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof (window as any).ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          const signer = provider.getSigner()
          const network = await provider.getNetwork()

          setProvider(provider)
          setSigner(signer)
          setAccount(accounts[0])
          setChainId(network.chainId)
          setConnected(true)
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof (window as any).ethereum === "undefined") {
      toast.error("MetaMask no está instalado")
      return
    }

    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      await provider.send("eth_requestAccounts", [])

      const signer = provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setProvider(provider)
      setSigner(signer)
      setAccount(address)
      setChainId(network.chainId)
      setConnected(true)

      toast.success("Wallet conectada exitosamente")
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      toast.error("Error al conectar wallet")
    }
  }

  const disconnectWallet = () => {
    disconnect()
    toast.success("Wallet desconectada")
  }

  return <Web3Context.Provider value={{ connectWallet, disconnectWallet }}>{children}</Web3Context.Provider>
}