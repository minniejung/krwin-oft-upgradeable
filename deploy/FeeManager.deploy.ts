import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'FeeManager' 

const deploy: DeployFunction = async (hre) => {
    const { deploy } = hre.deployments
    const signer = (await hre.ethers.getSigners())[0]
    
    // 모든 네트워크에 배포
    console.log(`>>> Deploying ${contractName} on ${hre.network.name} >>>`)
    console.log(`>>> Signer address >>> ${signer.address}`)
    
    await deploy(contractName, {
        from: signer.address,
        args: [],
        log: true,
        waitConfirmations: 2,
        skipIfAlreadyDeployed: true, 
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            owner: signer.address,
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [
                        '0x0000000000000000000000000000000000000000', // KRWIN 주소는 나중에 설정
                        signer.address, // LP Receiver
                        signer.address, // Treasury Receiver
                    ],
                },
            },
        },
    })

    // 검증 로직...
}

deploy.tags = ['FeeManager'] 
export default deploy 