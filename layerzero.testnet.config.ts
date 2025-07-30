import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools'

import { createTestnetPathways, getTestnetDeployedContracts } from './utils/helpers/layerzero.testnet.helper'

export default async function () {
    const pathways = createTestnetPathways()
    const connections = await generateConnectionsConfig(pathways)

    return {
        contracts: getTestnetDeployedContracts().map((contract) => ({ contract })),
        connections,
    }
}
