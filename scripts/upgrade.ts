import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { getDeploymentAddressAndAbi } from '@layerzerolabs/lz-evm-sdk-v2'
import { ethers } from "hardhat";
import { NETWORKS, CONTRACT_CONFIG } from "../utils/consts/network.const";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log(">>> Signer address >>>", signer.address);
    
    const network = await ethers.provider.getNetwork();
    console.log(">>> Network chainId >>>", network.chainId);
    
    const networkConfig = NETWORKS[network.chainId as keyof typeof NETWORKS];
    if (!networkConfig) {
        console.error(`>>> No config for chainId >>> ${network.chainId}`);
        return;
    }
    
    const proxyAddress = networkConfig.contractAddress;
    console.log(`\n>>> Upgrading Proxy on ${networkConfig.name} >>>`);
    console.log(`>>> Proxy address >>> ${proxyAddress}`);
    
    try {
        const { upgrades } = require("hardhat");
        const currentImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress)
        console.log('>>> Current implementation address >>>', currentImplementation)
        
        const eid = networkConfig.eid as EndpointId
        const lzNetworkName = endpointIdToNetwork(eid)
        const { address: endpointAddress } = getDeploymentAddressAndAbi(lzNetworkName, 'EndpointV2')
        
        console.log('>>> LayerZero Endpoint address >>>', endpointAddress)
        
        console.log('>>> Deploying new implementation manually... >>>')
        const KRWIN = await ethers.getContractFactory('KRWIN')
        const newImplementation = await KRWIN.deploy(endpointAddress)
        await newImplementation.deployed()
        
        console.log('>>> New implementation deployed at >>>', newImplementation.address)
        
        console.log('>>> Upgrading proxy to new implementation... >>>')
        const proxyAdmin = await upgrades.erc1967.getAdminAddress(proxyAddress)
        const proxyAdminContract = await ethers.getContractAt('ProxyAdmin', proxyAdmin)
        
        const tx = await proxyAdminContract.upgrade(
            proxyAddress,
            newImplementation.address
        )
        await tx.wait()
        
        console.log('>>> Proxy upgraded successfully >>> YAY!')
        console.log(`>>> Transaction hash >>> ${tx.hash}`)
        
        const upgradedContract = await ethers.getContractAt('KRWIN', proxyAddress)
        const name = await upgradedContract.name()
        const symbol = await upgradedContract.symbol()
        
        console.log('>>> Contract verification >>>')
        console.log('>>> Name >>>', name)
        console.log('>>> Symbol >>>', symbol)
        
    } catch (error) {
        console.error(">>> Error upgrading proxy >>>", error.message);
        console.error(">>> Full error >>>", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 