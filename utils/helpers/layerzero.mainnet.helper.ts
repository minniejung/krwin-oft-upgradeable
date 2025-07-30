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

export const getMainnetDeployedContracts = (): OmniPointHardhat[] => {
    const contracts: OmniPointHardhat[] = []

    try {
        const mainnetContract = createContractConfig('mainnet', EndpointId.ETHEREUM_V2_MAINNET)
        contracts.push(mainnetContract)
        console.log('>>> ✅ Mainnet contract >>>', mainnetContract.address)
    } catch (error) {
        console.warn('>>> ❌ Mainnet contract not available')
    }

    try {
        const avalancheContract = createContractConfig('avalanche-mainnet', EndpointId.AVALANCHE_V2_MAINNET)
        contracts.push(avalancheContract)
        console.log('>>> ✅ Avalanche mainnet contract >>>', avalancheContract.address)
    } catch (error) {
        console.warn('>>> ❌ Avalanche mainnet contract not available')
    }

    return contracts
}

export const createMainnetPathways = (): TwoWayConfig[] => {
    const pathways: TwoWayConfig[] = []

    try {
        const mainnetContract = createContractConfig('mainnet', EndpointId.ETHEREUM_V2_MAINNET)
        const avalancheContract = createContractConfig('avalanche-mainnet', EndpointId.AVALANCHE_V2_MAINNET)

        pathways.push(addNetworkPathway(mainnetContract, avalancheContract))
        console.log('>>> Mainnet pathways created >>>', pathways.length)
    } catch (error) {
        console.warn('Could not create mainnet pathways: insufficient deployed contracts')
    }

    return pathways
}
