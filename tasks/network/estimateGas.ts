import { task } from 'hardhat/config'

task('estimate:gas', 'Estimate gas costs for deployment').setAction(async (_, hre) => {
    const { ethers } = hre

    console.log('>>> Gas Estimation for KRWIN and FeeManager Deployment >>>')

    const networks = [
        {
            name: 'Ethereum Mainnet',
            chainId: 1,
            rpcUrl: process.env.RPC_URL_ETHEREUM_MAINNET,
            endpointAddress: '0x1a44076050125825900e736c501f859c50fE728c', // V2 address
        },
        {
            name: 'Avalanche Mainnet',
            chainId: 43114,
            rpcUrl: process.env.RPC_URL_AVALANCHE_MAINNET,
            endpointAddress: '0x1a44076050125825900e736c501f859c50fE728c', // V2 address
        },
    ]

    const ethPrice = 3716.89 // e.g. 1 ETH = 3000 USD
    const avaxPrice = 24 // e.g. 1 AVAX = 30 USD

    for (const network of networks) {
        console.log(`\n>>> Estimating for ${network.name} >>>`)

        try {
            const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl)

            const currentGasPrice = await provider.getGasPrice()
            console.log(`>>> Current gas price >>> ${ethers.utils.formatUnits(currentGasPrice, 'gwei')} gwei`)

            const endpointAddress = network.endpointAddress

            console.log('>>> Estimating KRWIN deployment gas >>>')
            const KRWIN = await ethers.getContractFactory('KRWIN')

            const krwinDeploymentData = KRWIN.getDeployTransaction(endpointAddress)
            const krwinGasEstimate = await provider.estimateGas(krwinDeploymentData)

            console.log(`>>> KRWIN deployment gas estimate >>> ${krwinGasEstimate.toString()}`)
            console.log(
                `>>> KRWIN deployment cost >>> ${ethers.utils.formatEther(krwinGasEstimate.mul(currentGasPrice))} ETH/AVAX`
            )

            console.log('>>> Estimating FeeManager deployment gas >>>')
            const FeeManager = await ethers.getContractFactory('FeeManager')

            const feeManagerDeploymentData = FeeManager.getDeployTransaction()
            const feeManagerGasEstimate = await provider.estimateGas(feeManagerDeploymentData)

            console.log(`>>> FeeManager deployment gas estimate >>> ${feeManagerGasEstimate.toString()}`)
            console.log(
                `>>> FeeManager deployment cost >>> ${ethers.utils.formatEther(feeManagerGasEstimate.mul(currentGasPrice))} ETH/AVAX`
            )

            console.log('>>> Estimating wiring gas >>>')
            const wiringGasEstimate = ethers.BigNumber.from('500000')
            console.log(`>>> Wiring gas estimate >>> ${wiringGasEstimate.toString()}`)
            console.log(
                `>>> Wiring cost >>> ${ethers.utils.formatEther(wiringGasEstimate.mul(currentGasPrice))} ETH/AVAX`
            )

            const totalGas = krwinGasEstimate.add(feeManagerGasEstimate).add(wiringGasEstimate)
            const totalCost = totalGas.mul(currentGasPrice)

            console.log(`>>> Total gas estimate >>> ${totalGas.toString()}`)
            console.log(`>>> Total deployment cost >>> ${ethers.utils.formatEther(totalCost)} ETH/AVAX`)

            const pricePerUnit = network.chainId === 1 ? ethPrice : avaxPrice
            const totalCostUSD = parseFloat(ethers.utils.formatEther(totalCost)) * pricePerUnit

            console.log(`>>> Total cost in USD >>> $${totalCostUSD.toFixed(2)}`)
        } catch (error) {
            console.error(`>>> Error estimating for ${network.name} >>>`, (error as any).message)
        }
    }

    console.log('\n>>> Gas estimation completed >>>')
    console.log('>>> Note: Actual costs may vary based on network conditions >>>')
    console.log('>>> Run this task before mainnet deployment >>>')
})
