import { task } from 'hardhat/config'

import { CONTRACT_CONFIG, NETWORKS } from '../../utils/consts/network.const'

task('set:owner', 'Set new owner for contract')
    .addParam('newOwner', 'New owner address')
    .setAction(async (taskArgs, hre) => {
        const { ethers } = hre

        const [signer] = await ethers.getSigners()
        console.log('>>> Signer address >>>', signer.address)

        const newOwnerAddress = taskArgs.newOwner
        console.log('>>> New owner address >>>', newOwnerAddress)

        const network = await ethers.provider.getNetwork()
        console.log('>>> Network chainId >>>', network.chainId)

        const networkConfig = NETWORKS[network.chainId as keyof typeof NETWORKS]
        if (!networkConfig) {
            console.error(`>>> No config for chainId >>> ${network.chainId}`)
            return
        }

        console.log(`\n>>> Setting Owner on ${networkConfig.name} >>>`)
        console.log(`>>> Contract address >>> ${networkConfig.contractAddress}`)

        try {
            const contract = await ethers.getContractAt(CONTRACT_CONFIG.name, networkConfig.contractAddress)

            const currentOwner = await contract.owner()
            console.log('>>> Current owner >>>', currentOwner)

            if (currentOwner === newOwnerAddress) {
                console.log('>>> Owner already set correctly >>> YAY!')
                return
            }

            const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE()
            const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address)

            if (!hasAdminRole) {
                console.error('>>> Error >>> Signer does not have DEFAULT_ADMIN_ROLE')
                return
            }

            console.log('>>> Admin role confirmed >>> YAY!')

            console.log(`>>> Setting owner to ${newOwnerAddress}... >>>`)
            const tx = await contract.transferOwnership(newOwnerAddress)
            await tx.wait()

            console.log('>>> Owner set successfully >>> YAY!')
            console.log(`>>> Transaction hash >>> ${tx.hash}`)

            // 확인
            const newOwner = await contract.owner()
            console.log('>>> New owner >>>', newOwner)
        } catch (error) {
            console.error('>>> Error setting owner >>>', (error as any).message)
            console.error('>>> Full error >>>', error)
        }
    })
