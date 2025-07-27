import { generateConnectionsConfig } from '@layerzerolabs/metadata-tools'
import { 
    getAllDeployedContracts, 
    createPathways 
} from './utils/helpers/layerzero.helper'

export default async function () {
    const pathways = createPathways()
    const connections = await generateConnectionsConfig(pathways)
    
    return {
        contracts: getAllDeployedContracts().map(contract => ({ contract })),
        connections,
    }
}
