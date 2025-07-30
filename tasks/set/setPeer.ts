import { task } from 'hardhat/config'

import { CONTRACT_CONFIG, NETWORKS } from '../../utils/consts/network.const'

task('set:peer', 'Set peer for specific network')
    .addParam('targetChainId', 'Target chain ID to set peer for')
    .setAction(async (taskArgs, hre) => {
        const { ethers } = hre

        const [signer] = await ethers.getSigners()
        console.log('>>> Signer address >>>', signer.address)

        const network = await ethers.provider.getNetwork()
        console.log('>>> Network chainId >>>', network.chainId)

        const currentNetworkConfig = NETWORKS[network.chainId as keyof typeof NETWORKS]
        if (!currentNetworkConfig) {
            console.error(`>>> No config for chainId >>> ${network.chainId}`)
            return
        }

        const targetChainId = parseInt(taskArgs.targetChainId)
        const targetNetworkConfig = NETWORKS[targetChainId as keyof typeof NETWORKS]
        if (!targetNetworkConfig) {
            console.error(`>>> No config for target chainId >>> ${targetChainId}`)
            return
        }

        console.log(`\n>>> Setting Peer on ${currentNetworkConfig.name} >>>`)
        console.log(`>>> Contract address >>> ${currentNetworkConfig.contractAddress}`)
        console.log(`>>> Target network >>> ${targetNetworkConfig.name} (${targetChainId})`)

        try {
            const contract = await ethers.getContractAt(CONTRACT_CONFIG.name, currentNetworkConfig.contractAddress)

            const currentOwner = await contract.owner()
            console.log('>>> Current owner >>>', currentOwner)

            if (currentOwner !== signer.address) {
                console.error('>>> Error >>> Signer is not the owner')
                return
            }

            console.log('>>> Owner confirmed >>> YAY!')

            if (!targetNetworkConfig.contractAddress) {
                console.error(`>>> Error >>> No contract address for target network`)
                return
            }

            console.log(`\n>>> Setting peer for ${targetNetworkConfig.name} (${targetNetworkConfig.eid}) >>>`)
            console.log(`>>> Target contract >>> ${targetNetworkConfig.contractAddress}`)

            const peerBytes32 = ethers.utils.hexZeroPad(targetNetworkConfig.contractAddress, 32)
            console.log(`>>> Peer bytes32 >>> ${peerBytes32}`)

            const tx = await contract.setPeer(targetNetworkConfig.eid, peerBytes32)
            await tx.wait()

            console.log('>>> Peer set successfully >>> YAY!')
            console.log(`>>> Transaction hash >>> ${tx.hash}`)

            // 확인
            const peer = await contract.peers(targetNetworkConfig.eid)
            console.log(`>>> Verified peer >>> ${peer}`)
        } catch (error) {
            console.error('>>> Error setting peer >>>', (error as any).message)
            console.error('>>> Full error >>>', error)
        }
    })
