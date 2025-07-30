import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { getDeploymentAddressAndAbi } from '@layerzerolabs/lz-evm-sdk-v2'

import { NETWORKS } from '../../utils/consts/network.const'

task('upgrade:proxy', 'Upgrade proxy implementation').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
    const { ethers, upgrades } = hre

    const [signer] = await ethers.getSigners()
    console.log('>>> Signer address >>>', signer.address)

    const network = await ethers.provider.getNetwork()
    console.log('>>> Network chainId >>>', network.chainId)

    const networkConfig = NETWORKS[network.chainId as keyof typeof NETWORKS]
    if (!networkConfig) {
        console.error(`>>> No config for chainId >>> ${network.chainId}`)
        return
    }

    const address = networkConfig.contractAddress
    console.log('>>> Upgrading proxy at address:', address)

    try {
        const currentImplementation = await upgrades.erc1967.getImplementationAddress(address)
        console.log('>>> Current implementation address:', currentImplementation)

        const eid = hre.network.config.eid as EndpointId
        const lzNetworkName = endpointIdToNetwork(eid)
        const { address: endpointAddress } = getDeploymentAddressAndAbi(lzNetworkName, 'EndpointV2')

        console.log('>>> LayerZero Endpoint address:', endpointAddress)

        console.log('>>> Deploying new implementation manually...')
        const KRWIN = await ethers.getContractFactory('KRWIN')
        const newImplementation = await KRWIN.deploy(endpointAddress)
        await newImplementation.deployed()

        console.log('>>> New implementation deployed at:', newImplementation.address)

        console.log('>>> Upgrading proxy to new implementation...')
        const proxyAdmin = await upgrades.erc1967.getAdminAddress(address)
        const proxyAdminContract = await ethers.getContractAt('ProxyAdmin', proxyAdmin)

        const tx = await proxyAdminContract.upgrade(address, newImplementation.address)
        console.log('>>> Upgrade transaction hash >>>', tx.hash)

        const receipt = await tx.wait()
        console.log('>>> Upgrade transaction confirmed >>>', receipt.status === 1 ? 'SUCCESS' : 'FAILED')

        console.log('>>> Proxy upgraded successfully!')

        console.log('>>> Waiting for blockchain state update...')
        await new Promise((resolve) => setTimeout(resolve, 5000))

        const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(address)
        console.log('>>> New implementation address after upgrade:', newImplementationAddress)

        const upgradedContract = await ethers.getContractAt('KRWIN', address)
        const name = await upgradedContract.name()
        const symbol = await upgradedContract.symbol()

        console.log('>>> Contract verification:')
        console.log('>>> Name:', name)
        console.log('>>> Symbol:', symbol)

        if (newImplementationAddress === newImplementation.address) {
            console.log('>>> Upgrade verification successful! >>> ✓')
        } else {
            console.error('>>> Upgrade verification failed! >>> ✗')
            console.error('>>> Expected:', newImplementation.address)
            console.error('>>> Actual:', newImplementationAddress)
        }
    } catch (error) {
        console.error('>>> Upgrade failed:', error)
        throw error
    }
})
