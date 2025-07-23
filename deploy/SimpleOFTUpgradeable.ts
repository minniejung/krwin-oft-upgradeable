import { type DeployFunction } from 'hardhat-deploy/types'

import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { getDeploymentAddressAndAbi } from '@layerzerolabs/lz-evm-sdk-v2'

const contractName = 'SimpleOFTUpgradeable'

const deploy: DeployFunction = async (hre) => {
    const { deploy } = hre.deployments
    const signer = (await hre.ethers.getSigners())[0]
    console.log(`deploying ${contractName} on network: ${hre.network.name} with ${signer.address}`)

    const eid = hre.network.config.eid as EndpointId
    const lzNetworkName = endpointIdToNetwork(eid)

    const { address } = getDeploymentAddressAndAbi(lzNetworkName, 'EndpointV2')

    // Set token name and symbol based on network
    let tokenName = 'StableCoin'
    let tokenSymbol = 'STBL'
    
    if (hre.network.name === 'sepolia-testnet') {
        tokenName = 'StableCoin Sepolia'
        tokenSymbol = 'STBL-SEP'
    } else if (hre.network.name === 'base-testnet') {
        tokenName = 'StableCoin Base'
        tokenSymbol = 'STBL-BASE'
    }

    await deploy(contractName, {
        from: signer.address,
        args: [address], // OFTUpgradeable은 lzEndpoint만 받음
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: true, 
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            owner: signer.address,
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [tokenName, tokenSymbol, signer.address, signer.address], // name, symbol, delegate, admin
                },
            },
        },
    })

    // 배포 후 초기화 상태 확인
    const deployedContract = await hre.deployments.get(contractName)
    const contract = await hre.ethers.getContractAt("SimpleOFTUpgradeable", deployedContract.address)
    console.log(`Contract deployed at: ${deployedContract.address}`)

    // 초기화가 제대로 되었는지 확인
    try {
        const name = await contract.name()
        const symbol = await contract.symbol()
        console.log(`Token initialized - Name: ${name}, Symbol: ${symbol}`)
    } catch (error) {
        console.error('Contract initialization failed:', error)
    }
}

deploy.tags = ['SimpleOFTUpgradeable']
export default deploy 