import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

task('upgrade:verify', 'Verify proxy upgrade and implementation address')
    .addParam('address', 'Proxy contract address')
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const { address } = taskArgs
        const { ethers, upgrades } = hre

        console.log('>>> Verifying upgrade for proxy at address:', address)

        try {
            const currentImplementation = await upgrades.erc1967.getImplementationAddress(address)
            console.log('>>> Current implementation address:', currentImplementation)

            const proxyAdmin = await upgrades.erc1967.getAdminAddress(address)
            console.log('>>> ProxyAdmin address:', proxyAdmin)

            const contract = await ethers.getContractAt('KRWIN', address)
            const name = await contract.name()
            const symbol = await contract.symbol()
            const totalSupply = await contract.totalSupply()

            console.log('>>> Contract Info:')
            console.log('>>> Name:', name)
            console.log('>>> Symbol:', symbol)
            console.log('>>> Total Supply:', totalSupply.toString())

            const blockNumber = await ethers.provider.getBlockNumber()
            console.log('>>> Current block number:', blockNumber)

            console.log('>>> Recent events:')
            const events = await contract.queryFilter('*', blockNumber - 10, blockNumber)
            events.forEach((event, index) => {
                console.log(`>>> Event ${index + 1}:`, event.event || 'Unknown', 'at block', event.blockNumber)
            })
        } catch (error) {
            console.error('>>> Verification failed:', error)
            throw error
        }
    })
