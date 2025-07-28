async function main() {
    const { ethers } = require('hardhat')

    console.log('>>> Gas Estimation for KRWIN and FeeManager Deployment >>>')

    const networks = [
        {
            name: 'Ethereum Mainnet',
            chainId: 1,
            rpcUrl: process.env.RPC_URL_ETHEREUM_MAINNET,
            gasPrice: ethers.utils.parseUnits('40', 'gwei'), // hard coded gas fee
        },
        {
            name: 'Avalanche Mainnet',
            chainId: 43114,
            rpcUrl: process.env.RPC_URL_AVALANCHE_MAINNET,
            gasPrice: ethers.utils.parseUnits('10', 'gwei'), // hard coded gas fee
        },
    ]

    for (const network of networks) {
        console.log(`\n>>> Estimating for ${network.name} >>>`)

        try {
            const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl)

            const currentGasPrice = await provider.getGasPrice()
            console.log(`>>> Current gas price >>> ${ethers.utils.formatUnits(currentGasPrice, 'gwei')} gwei`)

            // real gas price
            const gasPrice = currentGasPrice

            console.log('>>> Estimating KRWIN deployment gas >>>')
            const KRWIN = await ethers.getContractFactory('KRWIN')

            const endpointAddress = '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675' // V2 address

            const krwinDeploymentData = KRWIN.getDeployTransaction(endpointAddress)
            const krwinGasEstimate = await provider.estimateGas(krwinDeploymentData)

            console.log(`>>> KRWIN deployment gas estimate >>> ${krwinGasEstimate.toString()}`)
            console.log(
                `>>> KRWIN deployment cost >>> ${ethers.utils.formatEther(krwinGasEstimate.mul(gasPrice))} ETH/AVAX`
            )

            console.log('>>> Estimating FeeManager deployment gas >>>')
            const FeeManager = await ethers.getContractFactory('FeeManager')

            const feeManagerDeploymentData = FeeManager.getDeployTransaction()
            const feeManagerGasEstimate = await provider.estimateGas(feeManagerDeploymentData)

            console.log(`>>> FeeManager deployment gas estimate >>> ${feeManagerGasEstimate.toString()}`)
            console.log(
                `>>> FeeManager deployment cost >>> ${ethers.utils.formatEther(feeManagerGasEstimate.mul(gasPrice))} ETH/AVAX`
            )

            const totalGas = krwinGasEstimate.add(feeManagerGasEstimate)
            const totalCost = totalGas.mul(gasPrice)

            console.log(`>>> Total gas estimate >>> ${totalGas.toString()}`)
            console.log(`>>> Total deployment cost >>> ${ethers.utils.formatEther(totalCost)} ETH/AVAX`)
        } catch (error) {
            console.error(`>>> Error estimating for ${network.name} >>>`, error.message)
        }
    }

    console.log('\n>>> Gas estimation completed >>>')
    console.log('>>> Note: Actual costs may vary based on network conditions >>>')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
