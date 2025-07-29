async function main() {
    const { ethers } = require('hardhat')

    console.log('>>> Gas Estimation for KRWIN and FeeManager Deployment >>>')

    const networks = [
        {
            name: 'Ethereum Mainnet',
            chainId: 1,
            rpcUrl: process.env.RPC_URL_ETHEREUM_MAINNET,
            endpointAddress: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675', // V2 address
        },
        {
            name: 'Avalanche Mainnet',
            chainId: 43114,
            rpcUrl: process.env.RPC_URL_AVALANCHE_MAINNET,
            endpointAddress: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675', // V2 address
        },
    ]

    for (const network of networks) {
        console.log(`\n>>> Estimating for ${network.name} >>>`)

        try {
            const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl)

            const currentGasPrice = await provider.getGasPrice()
            console.log(`>>> Current gas price >>> ${ethers.utils.formatUnits(currentGasPrice, 'gwei')} gwei`)

            // LayerZero V2 Endpoint 주소
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

            // Wiring 가스 추정 (setPeer, setFeeManager 등)
            console.log('>>> Estimating wiring gas >>>')
            const wiringGasEstimate = ethers.BigNumber.from('500000') // 예상값
            console.log(`>>> Wiring gas estimate >>> ${wiringGasEstimate.toString()}`)
            console.log(
                `>>> Wiring cost >>> ${ethers.utils.formatEther(wiringGasEstimate.mul(currentGasPrice))} ETH/AVAX`
            )

            const totalGas = krwinGasEstimate.add(feeManagerGasEstimate).add(wiringGasEstimate)
            const totalCost = totalGas.mul(currentGasPrice)

            console.log(`>>> Total gas estimate >>> ${totalGas.toString()}`)
            console.log(`>>> Total deployment cost >>> ${ethers.utils.formatEther(totalCost)} ETH/AVAX`)

            // USD 환산 (대략적)
            const ethPrice = 3000 // USD (실시간 가격 확인 필요)
            const avaxPrice = 30 // USD
            const pricePerUnit = network.chainId === 1 ? ethPrice : avaxPrice
            const totalCostUSD = parseFloat(ethers.utils.formatEther(totalCost)) * pricePerUnit

            console.log(`>>> Total cost in USD >>> $${totalCostUSD.toFixed(2)}`)
        } catch (error) {
            console.error(`>>> Error estimating for ${network.name} >>>`, error.message)
        }
    }

    console.log('\n>>> Gas estimation completed >>>')
    console.log('>>> Note: Actual costs may vary based on network conditions >>>')
    console.log('>>> Run this script before mainnet deployment >>>')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
