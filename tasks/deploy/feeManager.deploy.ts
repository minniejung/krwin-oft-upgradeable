import { task } from 'hardhat/config'

import { NETWORKS } from '../../utils/consts/network.const'

task('deploy:feeManager', 'Deploy FeeManager with dynamic arguments')
    .addOptionalParam('krwinAddress', 'KRWIN contract address (will be fetched if not provided)')
    .addOptionalParam('lpReceiver', 'LP Receiver address (default: signer address)')
    .addOptionalParam('treasuryReceiver', 'Treasury Receiver address (default: signer address)')
    .setAction(async (taskArgs, hre) => {
        const [signer] = await hre.ethers.getSigners()
        console.log('>>> Signer address >>>', signer.address)

        const network = await hre.ethers.provider.getNetwork()
        console.log('>>> Network chainId >>>', network.chainId)

        const networkConfig = NETWORKS[network.chainId as keyof typeof NETWORKS]
        if (!networkConfig) {
            console.error(`>>> No config for chainId >>> ${network.chainId}`)
            return
        }

        console.log(`\n>>> Deploying FeeManager on ${networkConfig.name} >>>`)

        const krwinAddress = taskArgs.krwinAddress || networkConfig.contractAddress
        const lpReceiver = taskArgs.lpReceiver || signer.address
        const treasuryReceiver = taskArgs.treasuryReceiver || signer.address

        console.log(`>>> KRWIN address >>> ${krwinAddress}`)
        console.log(
            `>>> LP Receiver >>> ${lpReceiver} ${lpReceiver === signer.address ? '(default: signer)' : '(custom)'}`
        )
        console.log(
            `>>> Treasury Receiver >>> ${treasuryReceiver} ${treasuryReceiver === signer.address ? '(default: signer)' : '(custom)'}`
        )

        try {
            const { deploy } = hre.deployments

            await deploy('FeeManager', {
                from: signer.address,
                args: [],
                log: true,
                waitConfirmations: 2,
                skipIfAlreadyDeployed: false,
                proxy: {
                    proxyContract: 'OpenZeppelinTransparentProxy',
                    owner: signer.address,
                    execute: {
                        init: {
                            methodName: 'initialize',
                            args: [krwinAddress, lpReceiver, treasuryReceiver],
                        },
                    },
                },
            })

            console.log('>>> FeeManager deployed successfully >>> ✓')

            const deployment = await hre.deployments.get('FeeManager')
            console.log(`>>> FeeManager address >>> ${deployment.address}`)

            const feeManager = await hre.ethers.getContractAt('FeeManager', deployment.address)
            const actualLpReceiver = await feeManager.lpReceiver()
            const actualTreasuryReceiver = await feeManager.treasuryReceiver()

            console.log('>>> Verification >>>')
            console.log(`>>> Actual LP Receiver >>> ${actualLpReceiver}`)
            console.log(`>>> Actual Treasury Receiver >>> ${actualTreasuryReceiver}`)
        } catch (error) {
            console.error('>>> Error deploying FeeManager >>>', (error as Error).message)
            console.error('>>> Full error >>>', error)
        }
    })
