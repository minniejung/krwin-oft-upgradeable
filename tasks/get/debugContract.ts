import { task } from 'hardhat/config'

import { CONTRACT_CONFIG, NETWORKS } from '../../utils/consts/network.const'

task('debug:contract', 'Debug contract state and configuration').setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners()
    console.log('>>> Signer address >>>', signer.address)

    const network = await hre.ethers.provider.getNetwork()
    console.log('>>> Network chainId >>>', network.chainId)

    const networkConfig = NETWORKS[network.chainId as keyof typeof NETWORKS]
    if (!networkConfig) {
        console.error(`>>> No config for chainId >>> ${network.chainId}`)
        return
    }

    console.log(`\n>>> Contract Debug on ${networkConfig.name} >>>`)
    console.log(`>>> Contract address >>> ${networkConfig.contractAddress}`)

    const contract = await hre.ethers.getContractAt(CONTRACT_CONFIG.name, networkConfig.contractAddress)

    const name = await contract.name()
    const symbol = await contract.symbol()
    const totalSupply = await contract.totalSupply()

    console.log('>>> Token name >>>', name)
    console.log('>>> Token symbol >>>', symbol)
    console.log('>>> Total supply >>>', hre.ethers.utils.formatEther(totalSupply))

    const MINTER_ROLE = await contract.MINTER_ROLE()
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE()

    const hasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address)
    const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address)

    console.log('>>> Signer has MINTER_ROLE >>>', hasMinterRole)
    console.log('>>> Signer has DEFAULT_ADMIN_ROLE >>>', hasAdminRole)

    const endpoint = await contract.endpoint()
    console.log('>>> Endpoint >>>', endpoint)

    try {
        const owner = await contract.owner()
        console.log('>>> Contract owner >>>', owner)
    } catch (error) {
        console.log('>>> Owner function not available - using DEFAULT_ADMIN_ROLE instead >>>')
        console.log('>>> Signer is DEFAULT_ADMIN_ROLE >>>', hasAdminRole)
        console.log('>>> Actual admin address >>>', signer.address)
    }
})
