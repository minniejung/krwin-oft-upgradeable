import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { getDeploymentAddressAndAbi } from '@layerzerolabs/lz-evm-sdk-v2'

const networks = [
    {
        name: 'Ethereum Mainnet',
        chainId: 1,
        rpcUrl: process.env.RPC_URL_ETHEREUM_MAINNET || 'https://rpc.ankr.com/eth',
        eid: EndpointId.ETHEREUM_V2_MAINNET,
        privateKey: process.env.PRIVATE_KEY_METAMASK_2,
    },
    {
        name: 'Avalanche Mainnet',
        chainId: 43114,
        rpcUrl: process.env.RPC_URL_AVALANCHE_MAINNET || 'https://api.avax.network/ext/bc/C/rpc',
        eid: EndpointId.AVALANCHE_V2_MAINNET,
        privateKey: process.env.PRIVATE_KEY_METAMASK_2,
    },
]

async function main() {
    const { ethers } = require('hardhat')

    for (const network of networks) {
        console.log(`\n>>> Checking ${network.name} >>>`)

        try {
            console.log('>>> Testing RPC connection... >>>')
            const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl)
            const blockNumber = await provider.getBlockNumber()
            console.log(`>>> Current block number >>> ${blockNumber}`)
            console.log(`>>> RPC connection successful`)

            console.log('>>> Checking account... >>>')
            if (!network.privateKey) {
                console.log(`>>> Private key not found for ${network.name}`)
                continue
            }

            const wallet = new ethers.Wallet(network.privateKey, provider)
            const balance = await wallet.getBalance()
            console.log(`>>> Account address >>> ${wallet.address}`)
            console.log(`>>> Account balance >>> ${ethers.utils.formatEther(balance)} ETH/AVAX`)
            console.log(`>>> Account configured`)

            console.log('>>> Checking LayerZero Endpoint... >>>')
            const lzNetworkName = endpointIdToNetwork(network.eid)
            console.log(`>>> LayerZero Network >>> ${lzNetworkName}`)
            console.log(`>>> Endpoint ID >>> ${network.eid}`)

            const { address } = getDeploymentAddressAndAbi(lzNetworkName, 'EndpointV2')
            console.log(`>>> LayerZero Endpoint >>> ${address}`)

            const endpointCode = await provider.getCode(address)
            if (endpointCode !== '0x') {
                console.log(`>>> LayerZero Endpoint exists`)
            } else {
                console.log(`>>> LayerZero Endpoint not found`)
            }

            console.log('>>> Checking gas price... >>>')
            const gasPrice = await provider.getGasPrice()
            console.log(`>>> Current gas price >>> ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`)
        } catch (error) {
            console.error(`>>> Error checking ${network.name} >>>`, error.message)
        }
    }

    console.log('\n>>> Deployment check completed >>>')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
