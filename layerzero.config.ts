import { EndpointId } from '@layerzerolabs/lz-definitions'
import { ExecutorOptionType } from '@layerzerolabs/lz-v2-utilities'
import { TwoWayConfig, generateConnectionsConfig } from '@layerzerolabs/metadata-tools'
import { OAppEnforcedOption } from '@layerzerolabs/toolbox-hardhat'

import type { OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'SimpleOFTUpgradeable',
    address: '0x2094F2bc1DB87E1Ac31Cc2bF895411E3098cBf2a', 
}

const baseContract: OmniPointHardhat = {
    eid: EndpointId.BASESEP_V2_TESTNET,
    contractName: 'SimpleOFTUpgradeable',
    address: '0x65CB65FAc23443F5d0BB1F350BcC11A3638645d5', 
}

const EVM_ENFORCED_OPTIONS: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 500000,
        value: 0,
    },
]

const pathways: TwoWayConfig[] = [
    [
        sepoliaContract,
        baseContract,
        [['LayerZero Labs'], [['LayerZero Labs'], 1]],
        [1, 1],
        [EVM_ENFORCED_OPTIONS, EVM_ENFORCED_OPTIONS],
    ],
]

export default async function () {
    const connections = await generateConnectionsConfig(pathways)
    return {
        contracts: [
            { contract: sepoliaContract },
            { contract: baseContract },
        ],
        connections,
    }
}
