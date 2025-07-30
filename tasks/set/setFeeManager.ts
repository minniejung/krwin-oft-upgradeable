import { task } from 'hardhat/config'

import { CONTRACT_CONFIG, NETWORKS } from '../../utils/consts/network.const'

task('set:feeManager', 'Set FeeManager address in KRWIN contract')
    .addParam('address', 'FeeManager contract address')
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

        console.log(`\n>>> Setting FeeManager on ${networkConfig.name} >>>`)
        console.log(`>>> KRWIN Contract address >>> ${networkConfig.contractAddress}`)
        console.log(`>>> FeeManager address >>> ${taskArgs.address}`)

        try {
            const krwinContract = await hre.ethers.getContractAt(CONTRACT_CONFIG.name, networkConfig.contractAddress)

            const OPERATOR_ROLE = await krwinContract.OPERATOR_ROLE()
            const hasOperatorRole = await krwinContract.hasRole(OPERATOR_ROLE, signer.address)

            if (!hasOperatorRole) {
                console.error(">>> Error >>> Signer doesn't have OPERATOR_ROLE")
                return
            }

            console.log('>>> Operator role confirmed >>> ✓')

            console.log('>>> Setting FeeManager...')
            const tx = await krwinContract.setFeeManager(taskArgs.address)
            await tx.wait()

            console.log('>>> FeeManager set successfully >>> ✓')
            console.log(`>>> Transaction hash >>> ${tx.hash}`)

            const currentFeeManager = await krwinContract.feeManager()
            console.log(`>>> Verified FeeManager >>> ${currentFeeManager}`)

            console.log('>>> Setting mint fee to 0%...')
            const setMintFeeTx = await krwinContract.setMintFee(0)
            await setMintFeeTx.wait()

            console.log('>>> Mint fee set successfully >>> ✓')
            console.log(`>>> Mint fee transaction hash >>> ${setMintFeeTx.hash}`)

            console.log('>>> Setting burn fee to 0%...')
            const setBurnFeeTx = await krwinContract.setBurnFee(0)
            await setBurnFeeTx.wait()

            console.log('>>> Burn fee set successfully >>> ✓')
            console.log(`>>> Burn fee transaction hash >>> ${setBurnFeeTx.hash}`)

            const currentMintFee = await krwinContract.mintFee()
            const currentBurnFee = await krwinContract.burnFee()
            console.log(`>>> Current mint fee >>> ${currentMintFee} (${currentMintFee / 100}%)`)
            console.log(`>>> Current burn fee >>> ${currentBurnFee} (${currentBurnFee / 100}%)`)
        } catch (error) {
            console.error('>>> Error setting FeeManager >>>', error)
            console.error('>>> Full error >>>', error)
        }
    })
