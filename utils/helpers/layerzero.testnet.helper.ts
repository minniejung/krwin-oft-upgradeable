import { EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { TwoWayConfig } from '@layerzerolabs/metadata-tools'
import { OAppEnforcedOption, type OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'
import { CONTRACT_CONFIG } from '../consts/network.const'
import { getDeployedContractAddress } from './contract.helper'

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

export const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 500000,
        value: 0,
    },
]

export const addNetworkPathway = (network1: OmniPointHardhat, network2: OmniPointHardhat): TwoWayConfig => {
    return [
        network1,
        network2,
        [['LayerZero Labs'], [['LayerZero Labs'], 1]],
        [2, 2],
        [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
    ]
}

export const getTestnetDeployedContracts = (): OmniPointHardhat[] => {
    const contracts: OmniPointHardhat[] = []

    try {
        const sepoliaContract = createContractConfig('sepolia-testnet', EndpointId.SEPOLIA_V2_TESTNET)
        contracts.push(sepoliaContract)
        console.log('>>> ✅ Sepolia contract >>>', sepoliaContract.address)
    } catch (error) {
        console.warn('>>> ❌ Sepolia contract not available')
    }

    // try {
    //     const baseContract = createContractConfig('base-testnet', EndpointId.BASESEP_V2_TESTNET)
    //     contracts.push(baseContract)
    //     console.log('>>> ✅ Base contract >>>', baseContract.address)
    // } catch (error) {
    //     console.warn('>>> ❌ Base contract not available')
    // }

    try {
        const fujiContract = createContractConfig('avalanche-fuji-testnet', EndpointId.AVALANCHE_V2_TESTNET)
        contracts.push(fujiContract)
        console.log('>>> ✅ Fuji contract >>>', fujiContract.address)
    } catch (error) {
        console.warn('>>> ❌ Fuji contract not available')
    }

    // try {
    //     const hyperContract = createContractConfig('hyper-testnet', EndpointId.HYPERLIQUID_V2_TESTNET)
    //     contracts.push(hyperContract)
    //     console.log('>>> ✅ Hyper EVM contract >>>', hyperContract.address)
    // } catch (error) {
    //     console.warn('>>> ❌ Hyper EVM contract not available')
    // }

    return contracts
}

export const createTestnetPathways = (): TwoWayConfig[] => {
    const pathways: TwoWayConfig[] = []

    try {
        const sepoliaContract = createContractConfig('sepolia-testnet', EndpointId.SEPOLIA_V2_TESTNET)
        // const baseContract = createContractConfig('base-testnet', EndpointId.BASESEP_V2_TESTNET)
        const fujiContract = createContractConfig('avalanche-fuji-testnet', EndpointId.AVALANCHE_V2_TESTNET)
        // const hyperContract = createContractConfig('hyper-testnet', EndpointId.HYPERLIQUID_V2_TESTNET)

        // pathways.push(addNetworkPathway(sepoliaContract, baseContract))
        pathways.push(addNetworkPathway(sepoliaContract, fujiContract))
        // pathways.push(addNetworkPathway(baseContract, fujiContract))
        // pathways.push(addNetworkPathway(sepoliaContract, hyperContract))
        // pathways.push(addNetworkPathway(fujiContract, hyperContract))

        console.log('>>> Testnet pathways created >>>', pathways.length)
    } catch (error) {
        console.warn('Could not create testnet pathways: insufficient deployed contracts')
    }

    return pathways
}
