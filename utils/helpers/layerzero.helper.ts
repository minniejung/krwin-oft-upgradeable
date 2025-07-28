import { EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { TwoWayConfig } from '@layerzerolabs/metadata-tools'
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat'
import { NETWORKS, CONTRACT_CONFIG } from '../consts/network.const'

import type { OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

// Get deployed contract addresses from network config
export const getDeployedContractAddress = (networkName: string): string => {
    // Map network names to chainIds
    const networkMap: { [key: string]: number } = {
        'sepolia-testnet': 11155111,
        'base-testnet': 84532,
        'avalanche-fuji-testnet': 43113,
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

// Create contract configuration for each network
export const createContractConfig = (networkName: string, eid: number): OmniPointHardhat => {
    const address = getDeployedContractAddress(networkName)

    if (!address) {
        throw new Error(`KRWIN contract not deployed on ${networkName}`)
    }

    return {
        eid,
        contractName: CONTRACT_CONFIG.name,
        address,
    }
}

// LayerZero enforced options configuration
export const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 500000,
        value: 0,
    },
]

// Helper function to add new network pathways
export const addNetworkPathway = (network1: OmniPointHardhat, network2: OmniPointHardhat): TwoWayConfig => {
    return [
        network1,
        network2,
        [['LayerZero Labs'], [['LayerZero Labs'], 1]],
        [2, 2],
        [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
    ]
}

// Function to get all deployed contracts
export const getAllDeployedContracts = (): OmniPointHardhat[] => {
    const contracts: OmniPointHardhat[] = []

    // Add Sepolia contract if deployed
    try {
        const sepoliaContract = createContractConfig('sepolia-testnet', EndpointId.SEPOLIA_V2_TESTNET)
        contracts.push(sepoliaContract)
    } catch (error) {
        console.warn('Sepolia contract not available')
    }

    // Add Base contract if deployed
    try {
        const baseContract = createContractConfig('base-testnet', EndpointId.BASESEP_V2_TESTNET)
        contracts.push(baseContract)
    } catch (error) {
        console.warn('Base contract not available')
    }

    // Add Fuji contract if deployed
    try {
        const fujiContract = createContractConfig('avalanche-fuji-testnet', EndpointId.AVALANCHE_V2_TESTNET)
        contracts.push(fujiContract)
    } catch (error) {
        console.warn('Fuji contract not available')
    }

    // Add Hyper EVM contract if deployed
    try {
        const hyperContract = createContractConfig('hyper-testnet', EndpointId.HYPERLIQUID_V2_TESTNET)
        contracts.push(hyperContract)
    } catch (error) {
        console.warn('Hyper EVM contract not available')
    }

    return contracts
}

// Create pathways between deployed networks
export const createPathways = (): TwoWayConfig[] => {
    const pathways: TwoWayConfig[] = []

    try {
        const sepoliaContract = createContractConfig('sepolia-testnet', EndpointId.SEPOLIA_V2_TESTNET)
        const baseContract = createContractConfig('base-testnet', EndpointId.BASESEP_V2_TESTNET)
        const fujiContract = createContractConfig('avalanche-fuji-testnet', EndpointId.AVALANCHE_V2_TESTNET)
        const hyperContract = createContractConfig('hyper-testnet', EndpointId.HYPERLIQUID_V2_TESTNET)

        // Add pathway between Sepolia and Base
        pathways.push(addNetworkPathway(sepoliaContract, baseContract))

        // Add pathway between Sepolia and Fuji
        pathways.push(addNetworkPathway(sepoliaContract, fujiContract))

        // Add pathway between Base and Fuji
        pathways.push(addNetworkPathway(baseContract, fujiContract))

        // Add pathway between Sepolia and Hyper EVM
        pathways.push(addNetworkPathway(sepoliaContract, hyperContract))

        // Add pathway between Fuji and Hyper EVM
        pathways.push(addNetworkPathway(fujiContract, hyperContract))
    } catch (error) {
        console.warn('Could not create pathways: insufficient deployed contracts')
    }

    return pathways
}

// Additional network configurations for future use
export const ADDITIONAL_NETWORKS = {
    arbitrumSepolia: {
        networkName: 'arbitrum-sepolia-testnet',
        eid: EndpointId.ARBSEP_V2_TESTNET,
    },
    avalancheFuji: {
        networkName: 'avalanche-fuji-testnet',
        eid: EndpointId.AVALANCHE_V2_TESTNET,
    },
    amoy: {
        networkName: 'amoy-testnet',
        eid: EndpointId.AMOY_V2_TESTNET,
    },
} as const

// Check if network has deployed contract
export const hasDeployedContract = (networkName: string): boolean => {
    try {
        const address = getDeployedContractAddress(networkName)
        return address !== ''
    } catch {
        return false
    }
}

// Get list of deployed networks
export const getDeployedNetworks = (): string[] => {
    const networks = ['sepolia-testnet', 'base-testnet', 'avalanche-fuji-testnet']
    return networks.filter((network) => hasDeployedContract(network))
}
