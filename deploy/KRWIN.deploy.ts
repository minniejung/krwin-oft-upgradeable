import { type DeployFunction } from 'hardhat-deploy/types'

import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { getDeploymentAddressAndAbi } from '@layerzerolabs/lz-evm-sdk-v2'

const contractName = 'KRWIN' 

const deploy: DeployFunction = async (hre) => {
    const { deploy } = hre.deployments
    const signer = (await hre.ethers.getSigners())[0]
    
    // Show deployment info
    console.log(`>>> Deploying ${contractName} on network >>> ${hre.network.name}`)
    console.log(`>>> Signer address >>> ${signer.address}`)

    const eid = hre.network.config.eid as EndpointId
    const lzNetworkName = endpointIdToNetwork(eid)
    
    console.log(`>>> LayerZero Network >>> ${lzNetworkName}`)
    console.log(`>>> Endpoint ID >>> ${eid}`)

    const { address } = getDeploymentAddressAndAbi(lzNetworkName, 'EndpointV2')
    console.log(`>>> LayerZero Endpoint >>> ${address}`)

    const tokenName = 'KRWIN Stablecoin'
    const tokenSymbol = 'KRWIN'
    
    console.log(`>>> Token Name >>> ${tokenName}`)
    console.log(`>>> Token Symbol >>> ${tokenSymbol}`)
    
    console.log(`>>> Starting deployment...`)

    await deploy(contractName, {
        from: signer.address,
        args: [address], // lzEndpoint in OFTUpgradeable
        log: true,
        waitConfirmations: 2,
        skipIfAlreadyDeployed: true, 
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            owner: signer.address,
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [tokenName, tokenSymbol, signer.address, signer.address],
                },
            },
        },
    })

    // Verify deployment and initialization
    const deployedContract = await hre.deployments.get(contractName)
    const contract = await hre.ethers.getContractAt("KRWIN", deployedContract.address)
    console.log(`>>> Contract deployed at >>> ${deployedContract.address}`)

    // Check initialization status
    try {
        const name = await contract.name()
        const symbol = await contract.symbol()
        console.log(`>>> Token initialized - Name >>> ${name}, Symbol >>> ${symbol}`)
        console.log(`>>> Deployment completed successfully!`)
    } catch (error) {
        console.error('>>> Contract initialization failed >>>', error)
    }
}

deploy.tags = ['KRWIN'] 
export default deploy 