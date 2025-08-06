import { task } from 'hardhat/config'

import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { getDeploymentAddressAndAbi } from '@layerzerolabs/lz-evm-sdk-v2'

const contractName = 'ABC'
const tokenName = 'ABC Stablecoin'
const tokenSymbol = 'ABC'

task('deploy:abc', 'Deploy ABC contract').setAction(async (_, hre) => {
    const { deploy } = hre.deployments
    const signer = (await hre.ethers.getSigners())[0]

    console.log(`>>> Deploying ${contractName} on network >>> ${hre.network.name}`)
    console.log(`>>> Signer address >>> ${signer.address}`)
    console.log(`>>> deployer address >>> ${signer.address}`)

    const eid = hre.network.config.eid as EndpointId
    const lzNetworkName = endpointIdToNetwork(eid)

    console.log(`>>> LayerZero Network >>> ${lzNetworkName}`)
    console.log(`>>> Endpoint ID >>> ${eid}`)

    const { address } = getDeploymentAddressAndAbi(lzNetworkName, 'EndpointV2')
    console.log(`>>> LayerZero Endpoint >>> ${address}`)

    console.log(`>>> Token Name >>> ${tokenName}`)
    console.log(`>>> Token Symbol >>> ${tokenSymbol}`)

    console.log(`>>> Starting deployment...`)

    console.log('>>> signer.address:', signer.address)
    console.log('>>> initializer args:', [tokenName, tokenSymbol, signer.address, signer.address])
    console.log('>>> constructor args:', [address])

    await deploy(contractName, {
        from: signer.address,
        args: [address],
        log: true,
        waitConfirmations: 5,
        skipIfAlreadyDeployed: true,
        // gasPrice: hre.ethers.utils.parseUnits('0.5', 'gwei'), // 0.5 gwei
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

    const deployedContract = await hre.deployments.get(contractName)
    const contract = await hre.ethers.getContractAt('ABC', deployedContract.address)
    console.log(`>>> Contract deployed at >>> ${deployedContract.address}`)

    try {
        const name = await contract.name()
        const symbol = await contract.symbol()
        console.log(`>>> Token initialized - Name >>> ${name}, Symbol >>> ${symbol}`)
        console.log(`>>> Deployment completed successfully!`)
    } catch (error) {
        console.error('>>> Contract initialization failed >>>', error)
    }
})
