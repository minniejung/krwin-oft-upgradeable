import { task } from 'hardhat/config'

import { CONTRACT_CONFIG, NETWORKS } from '../../utils/consts/network.const'

task('check:balance', 'Check token balance and contract info')
    .addOptionalParam('address', 'Address to check balance for')
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners()
        const targetAddress = taskArgs.address || signer.address

        console.log('>>> Target address >>>', targetAddress)

        const network = await hre.ethers.provider.getNetwork()
        console.log('>>> Network chainId >>>', network.chainId)

        const networkConfig = NETWORKS[network.chainId as keyof typeof NETWORKS]

        if (!networkConfig) {
            console.error(`>>> No config for chainId >>> ${network.chainId}`)
            console.log('>>> Available networks >>>', Object.keys(NETWORKS))
            return
        }

        console.log(`\n>>> Balance Check on ${networkConfig.name} >>>`)

        const contract = await hre.ethers.getContractAt(CONTRACT_CONFIG.name, networkConfig.contractAddress)

        const balance = await contract.balanceOf(targetAddress)
        const totalSupply = await contract.totalSupply()

        console.log('>>> Balance >>>', hre.ethers.utils.formatEther(balance), CONTRACT_CONFIG.tokenSymbol)
        console.log('>>> Total supply >>>', hre.ethers.utils.formatEther(totalSupply), CONTRACT_CONFIG.tokenSymbol)

        const MINTER_ROLE = await contract.MINTER_ROLE()
        const hasMinterRole = await contract.hasRole(MINTER_ROLE, targetAddress)
        console.log('>>> Has MINTER_ROLE >>>', hasMinterRole)
    })

// npx hardhat check-balance --address 0x --network sepolia-testnet
