import { task } from 'hardhat/config'

task('estimate:feeData', 'Check current gas fee data from provider').setAction(async (_, hre) => {
    const { ethers } = hre

    const provider = ethers.provider

    const feeData = await provider.getFeeData()

    console.log('\n>>> Current Network:', hre.network.name)
    console.log('>>> Chain ID:', (await provider.getNetwork()).chainId)

    console.log('\n>>> Fee Data >>>')
    console.log('Gas Price:', hre.ethers.utils.formatUnits(feeData.gasPrice!, 'gwei'), 'gwei')
    console.log('Max Fee Per Gas:', hre.ethers.utils.formatUnits(feeData.maxFeePerGas!, 'gwei'), 'gwei')
    console.log(
        'Max Priority Fee Per Gas:',
        hre.ethers.utils.formatUnits(feeData.maxPriorityFeePerGas!, 'gwei'),
        'gwei'
    )

    console.log('\n>>> Note: If using EIP-1559, use maxFeePerGas & maxPriorityFeePerGas')
    console.log('>>> Otherwise, legacy gasPrice can still be passed manually\n')
})
