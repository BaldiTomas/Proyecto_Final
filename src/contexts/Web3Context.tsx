"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import toast from "react-hot-toast"

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  account: string | null
  isConnected: boolean
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

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          setProvider(provider)
          const signer = await provider.getSigner()
          setSigner(signer)
          setAccount(accounts[0].address)
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])

      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setProvider(provider)
      setSigner(signer)
      setAccount(address)
      setIsConnected(true)

      toast.success("Wallet connected successfully!")
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.code === 4001) {
        toast.error("Please connect to MetaMask.")
      } else {
        toast.error("An error occurred while connecting to your wallet.")
      }
    }
  }

  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setAccount(null)
    setIsConnected(false)
    toast.success("Wallet disconnected")
  }

  const value = {
    provider,
    signer,
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
