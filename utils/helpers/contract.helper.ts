import { NETWORKS } from '../consts/network.const'

export const getDeployedContractAddress = (networkName: string): string => {
    const networkMap: { [key: string]: number } = {
        'sepolia-testnet': 11155111,
        'base-testnet': 84532,
        'avalanche-fuji-testnet': 43113,
        'avalanche-mainnet': 43114,
        'ethereum-mainnet': 1,
    }

    const chainId = networkMap[networkName]
    if (!chainId) {
        console.warn(`Unknown network: ${networkName}`)
        return ''
    }

    const networkConfig = NETWORKS[chainId]
    if (!networkConfig || !networkConfig.contractAddress) {
        console.warn(`No contract address for ${networkName}`)
        return ''
    }

    return networkConfig.contractAddress
}

export const hasDeployedContract = (networkName: string): boolean => {
    try {
        const address = getDeployedContractAddress(networkName)
        return address !== ''
    } catch {
        return false
    }
}

export const getDeployedNetworks = (): string[] => {
    const networks = ['sepolia-testnet', 'base-testnet', 'avalanche-fuji-testnet', 'avalanche-mainnet', 'mainnet']
    return networks.filter((network) => hasDeployedContract(network))
}
