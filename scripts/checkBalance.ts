import { NETWORKS, CONTRACT_CONFIG } from '../utils/consts/network.const'

async function main() {
    const { ethers } = require('hardhat')

    const [signer] = await ethers.getSigners()
    console.log('>>> Signer address >>>', signer.address)

    const network = await ethers.provider.getNetwork()
    console.log('>>> Network chainId >>>', network.chainId)

    const networkConfig = NETWORKS[network.chainId]
    if (!networkConfig) {
        console.error(`>>> No config for chainId >>> ${network.chainId}`)
        return
    }

    console.log(`\n>>> Balance Check on ${networkConfig.name} >>>`)
    console.log(`>>> Contract address >>> ${networkConfig.contractAddress}`)

    try {
        const contract = await ethers.getContractAt(CONTRACT_CONFIG.name, networkConfig.contractAddress)

        const balance = await contract.balanceOf(signer.address)
        const totalSupply = await contract.totalSupply()

        console.log('>>> Your balance >>>', ethers.utils.formatEther(balance), CONTRACT_CONFIG.tokenSymbol)
        console.log('>>> Total supply >>>', ethers.utils.formatEther(totalSupply), CONTRACT_CONFIG.tokenSymbol)

        // 권한 확인
        const MINTER_ROLE = await contract.MINTER_ROLE()
        const hasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address)
        console.log('>>> Has MINTER_ROLE >>>', hasMinterRole)

        // Endpoint 정보
        const endpoint = await contract.endpoint()
        console.log('>>> Endpoint >>>', endpoint)

        // Peer 정보 (크로스체인 연결 확인)
        try {
            const sepoliaEid = 40161
            const baseEid = 40245

            if (network.chainId === 11155111) {
                // Sepolia
                const peer = await contract.peers(baseEid)
                console.log(`>>> Peer for Base (${baseEid}) >>>`, peer)
            } else if (network.chainId === 84532) {
                // Base
                const peer = await contract.peers(sepoliaEid)
                console.log(`>>> Peer for Sepolia (${sepoliaEid}) >>>`, peer)
            }
        } catch (error) {
            console.log('>>> Peer information not available >>>', error.message)
        }
    } catch (error) {
        console.error('>>> Error checking balance >>>', error.message)
        console.error('>>> Full error >>>', error)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
