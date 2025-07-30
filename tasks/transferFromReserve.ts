import { task } from 'hardhat/config'
import { CONTRACT_CONFIG, NETWORKS } from '../utils/consts/network.const'

task('transfer:reserve', 'Transfer tokens from reserve to specified address')
    .addParam('to', 'Target address to transfer tokens to')
    .addOptionalParam('amount', 'Amount to transfer (default: 100)', '100')
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners()
        console.log('>>> Signer address >>>', signer.address)

        const network = await hre.ethers.provider.getNetwork()
        console.log('>>> Network chainId >>>', network.chainId)

        const networkConfig = NETWORKS[network.chainId as keyof typeof NETWORKS]
        if (!networkConfig) {
            console.error(`>>> No config for chainId >>> ${network.chainId}`)
            return
        }

        console.log(`\n>>> Transfer From Reserve on ${networkConfig.name} >>>`)
        console.log(`>>> Contract address >>> ${networkConfig.contractAddress}`)
        console.log(`>>> Target address >>> ${taskArgs.to}`)
        console.log(`>>> Amount >>> ${taskArgs.amount} ${CONTRACT_CONFIG.tokenSymbol}`)

        try {
            const contract = await hre.ethers.getContractAt(CONTRACT_CONFIG.name, networkConfig.contractAddress)

            const MINTER_ROLE = await contract.MINTER_ROLE()
            const hasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address)

            if (!hasMinterRole) {
                console.error('>>> Error >>> Signer does not have MINTER_ROLE')
                return
            }

            console.log('>>> Minter role confirmed >>> YAY!')

            const currentBalance = await contract.balanceOf(signer.address)
            console.log(
                `>>> Current balance >>> ${hre.ethers.utils.formatEther(currentBalance)} ${CONTRACT_CONFIG.tokenSymbol}`
            )

            const transferAmount = hre.ethers.utils.parseEther(taskArgs.amount)
            console.log(
                `>>> Transfer amount >>> ${hre.ethers.utils.formatEther(transferAmount)} ${CONTRACT_CONFIG.tokenSymbol}`
            )

            if (currentBalance.lt(transferAmount)) {
                console.error('>>> Error >>> Insufficient balance for transfer')
                return
            }

            const tx = await contract.transferFromReserve(taskArgs.to, transferAmount)
            await tx.wait()

            console.log('>>> Transfer successful >>> YAY!')
            console.log(`>>> Transaction hash >>> ${tx.hash}`)

            const newBalance = await contract.balanceOf(signer.address)
            const targetBalance = await contract.balanceOf(taskArgs.to)

            console.log(
                `>>> Signer new balance >>> ${hre.ethers.utils.formatEther(newBalance)} ${CONTRACT_CONFIG.tokenSymbol}`
            )
            console.log(
                `>>> Target new balance >>> ${hre.ethers.utils.formatEther(targetBalance)} ${CONTRACT_CONFIG.tokenSymbol}`
            )
        } catch (error) {
            console.error('>>> Error transferring tokens >>>', error)
            console.error('>>> Full error >>>', error)
        }
    })
