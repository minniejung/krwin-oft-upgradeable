import { EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { TwoWayConfig } from '@layerzerolabs/metadata-tools'
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat'
import { CONTRACT_CONFIG } from '../consts/network.const'

import type { OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

// Get deployed contract addresses dynamically
export const getDeployedContractAddress = (networkName: string): string => {
    try {
        const deployment = require(`../deployments/${networkName}/KRWIN.json`)
        return deployment.address
    } catch (error) {
        console.warn(`KRWIN contract not found in deployments/${networkName}/`)
        return ''
    }
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
    
    return contracts
}

// Create pathways between deployed networks
export const createPathways = (): TwoWayConfig[] => {
    const pathways: TwoWayConfig[] = []
    
    try {
        const sepoliaContract = createContractConfig('sepolia-testnet', EndpointId.SEPOLIA_V2_TESTNET)
        const baseContract = createContractConfig('base-testnet', EndpointId.BASESEP_V2_TESTNET)
        
        // Add pathway between Sepolia and Base
        pathways.push(addNetworkPathway(sepoliaContract, baseContract))
        
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
    const networks = ['sepolia-testnet', 'base-testnet']
    return networks.filter(network => hasDeployedContract(network))
} 