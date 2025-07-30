import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools'

import { createMainnetPathways, getMainnetDeployedContracts } from './utils/helpers/layerzero.mainnet.helper'

export default async function () {
    const pathways = createMainnetPathways()
    const connections = await generateConnectionsConfig(pathways)

    return {
        contracts: getMainnetDeployedContracts().map((contract) => ({ contract })),
        connections,
    }
}
