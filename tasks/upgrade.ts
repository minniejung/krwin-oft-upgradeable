import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { getDeploymentAddressAndAbi } from '@layerzerolabs/lz-evm-sdk-v2'
import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

task('upgrade:proxy', 'Upgrade proxy implementation')
    .addParam('address', 'Proxy contract address')
    .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
        const { address } = taskArgs
        const { ethers, upgrades } = hre
        
        console.log('>>> Upgrading proxy at address:', address)
        
        try {
            // 1. 현재 implementation 주소 확인
            const currentImplementation = await upgrades.erc1967.getImplementationAddress(address)
            console.log('>>> Current implementation address:', currentImplementation)
            
            // 2. LayerZero Endpoint 주소 가져오기
            const eid = hre.network.config.eid as EndpointId
            const lzNetworkName = endpointIdToNetwork(eid)
            const { address: endpointAddress } = getDeploymentAddressAndAbi(lzNetworkName, 'EndpointV2')
            
            console.log('>>> LayerZero Endpoint address:', endpointAddress)
            
            // 3. 새로운 implementation 수동 배포
            console.log('>>> Deploying new implementation manually...')
            const KRWIN = await ethers.getContractFactory('KRWIN')
            const newImplementation = await KRWIN.deploy(endpointAddress)
            await newImplementation.deployed()
            
            console.log('>>> New implementation deployed at:', newImplementation.address)
            
            // 4. 프록시 업그레이드 (implementation 주소 직접 지정)
            console.log('>>> Upgrading proxy to new implementation...')
            const proxyAdmin = await upgrades.erc1967.getAdminAddress(address)
            const proxyAdminContract = await ethers.getContractAt('ProxyAdmin', proxyAdmin)
            
            await proxyAdminContract.upgrade(
                address,
                newImplementation.address
            )
            
            console.log('>>> Proxy upgraded successfully!')
            
            // 5. 업그레이드 확인
            const upgradedContract = await ethers.getContractAt('KRWIN', address)
            const name = await upgradedContract.name()
            const symbol = await upgradedContract.symbol()
            
            console.log('>>> Contract verification:')
            console.log('>>> Name:', name)
            console.log('>>> Symbol:', symbol)
        } catch (error) {
            console.error('>>> Upgrade failed:', error)
            throw error
        }
    }) 