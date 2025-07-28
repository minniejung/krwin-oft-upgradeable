import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

task('check:admin', 'Check ProxyAdmin owner')
    .addParam('address', 'Proxy contract address')
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const { address } = taskArgs
        const { ethers, upgrades } = hre
        
        try {
            const proxyAdmin = await upgrades.erc1967.getAdminAddress(address)
            const proxyAdminContract = await ethers.getContractAt('ProxyAdmin', proxyAdmin)
            const owner = await proxyAdminContract.owner()
            
            console.log('>>> ProxyAdmin address >>>', proxyAdmin)
            console.log('>>> ProxyAdmin owner >>>', owner)
            
        } catch (error) {
            console.error('>>> Check failed >>>', error)
        }
    }) 