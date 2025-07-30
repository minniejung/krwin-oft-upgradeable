import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools'

import { createPathways, getAllDeployedContracts } from './utils/helpers/layerzero.helper'

export default async function () {
    const pathways = createPathways()
    const connections = await generateConnectionsConfig(pathways)

    return {
        contracts: getAllDeployedContracts().map((contract) => ({ contract })),
        connections,
    }
}
