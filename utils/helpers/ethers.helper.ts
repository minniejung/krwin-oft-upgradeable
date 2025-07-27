import { ethers } from 'ethers'

// Get contract address from deployed contracts
export const getContractAddress = (network: string, contractName: string): string => {
    try {
        const deployment = require(`../../deployments/${network}/${contractName}.json`)
        return deployment.address
    } catch (error) {
        console.warn(`Contract ${contractName} not found in deployments/${network}/`)
        return ''
    }
}

// Get signer with optional private key
export const getSigner = (provider: ethers.providers.Provider, privateKey?: string, defaultSigner?: ethers.Signer) => {
    if (privateKey) {
        return new ethers.Wallet(privateKey, provider)
    }
    return defaultSigner
}

// Get contract instance
export const getContract = (address: string, abi: any, signerOrProvider?: ethers.Signer | ethers.providers.Provider) => {
    return new ethers.Contract(address, abi, signerOrProvider)
}

// Format address for display
export const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Convert wei to ether
export const weiToEther = (wei: ethers.BigNumber): string => {
    return ethers.utils.formatEther(wei)
}

// Convert ether to wei
export const etherToWei = (ether: string): ethers.BigNumber => {
    return ethers.utils.parseEther(ether)
}

// Wait for transaction confirmation
export const waitForTransaction = async (tx: ethers.providers.TransactionResponse): Promise<ethers.providers.TransactionReceipt> => {
    return await tx.wait()
}

// Get contract balance
export const getContractBalance = async (provider: ethers.providers.Provider, address: string): Promise<ethers.BigNumber> => {
    return await provider.getBalance(address)
}

// Check if address is valid
export const isValidAddress = (address: string): boolean => {
    return ethers.utils.isAddress(address)
}

// Get network information
export const getNetworkInfo = (network: string, rpcUrl: string, chainId?: number) => {
    return {
        name: network,
        isTestnet: network.includes('testnet'),
        rpcUrl,
        chainId
    }
} 