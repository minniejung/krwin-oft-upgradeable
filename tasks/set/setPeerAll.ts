import { task } from 'hardhat/config'

import { CONTRACT_CONFIG, NETWORKS } from '../../utils/consts/network.const'

task('set:peer:all', 'Set peers for all networks').setAction(async (_, hre) => {
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

    console.log(`\n>>> Setting Peers on ${currentNetworkConfig.name} >>>`)
    console.log(`>>> Contract address >>> ${currentNetworkConfig.contractAddress}`)

    try {
        const contract = await ethers.getContractAt(CONTRACT_CONFIG.name, currentNetworkConfig.contractAddress)

        const currentOwner = await contract.owner()
        console.log('>>> Current owner >>>', currentOwner)

        if (currentOwner !== signer.address) {
            console.error('>>> Error >>> Signer is not the owner')
            return
        }

        console.log('>>> Owner confirmed >>> YAY!')

        for (const [chainId, networkConfig] of Object.entries(NETWORKS)) {
            const targetChainId = parseInt(chainId)

            if (targetChainId === network.chainId) {
                continue
            }

            if (!networkConfig.contractAddress) {
                console.log(`>>> Skipping ${networkConfig.name} - no contract address >>>`)
                continue
            }

            console.log(`\n>>> Setting peer for ${networkConfig.name} (${networkConfig.eid}) >>>`)
            console.log(`>>> Target contract >>> ${networkConfig.contractAddress}`)

            const peerBytes32 = ethers.utils.hexZeroPad(networkConfig.contractAddress, 32)
            console.log(`>>> Peer bytes32 >>> ${peerBytes32}`)

            const tx = await contract.setPeer(networkConfig.eid, peerBytes32)
            await tx.wait()

            console.log('>>> Peer set successfully >>> YAY!')
            console.log(`>>> Transaction hash >>> ${tx.hash}`)

            const peer = await contract.peers(networkConfig.eid)
            console.log(`>>> Verified peer >>> ${peer}`)
        }
    } catch (error) {
        console.error('>>> Error setting peers >>>', (error as any).message)
        console.error('>>> Full error >>>', error)
    }
})
