import { NETWORKS, CONTRACT_CONFIG } from "../utils/consts/network.const";

async function main() {
    const { ethers } = require("hardhat");

    const [signer] = await ethers.getSigners();
    console.log(">>> Signer address >>>", signer.address);
    
    const network = await ethers.provider.getNetwork();
    console.log(">>> Network chainId >>>", network.chainId);
    
    const networkConfig = NETWORKS[network.chainId];
    if (!networkConfig) {
        console.error(`>>> No config for chainId >>> ${network.chainId}`);
        return;
    }
    
    console.log(`\n>>> Setting FeeManager on ${networkConfig.name} >>>`);
    console.log(`>>> KRWIN Contract address >>> ${networkConfig.contractAddress}`);
    
    try {
        const krwinContract = await ethers.getContractAt(CONTRACT_CONFIG.name, networkConfig.contractAddress);
        
        const feeManagerAddress = "FEE_MANAGER_DEPLOYED_ADDRESS";
        
        console.log(`>>> FeeManager address >>> ${feeManagerAddress}`);
        
        const hasOperatorRole = await krwinContract.hasRole(await krwinContract.OPERATOR_ROLE(), signer.address);
        if (!hasOperatorRole) {
            console.error(">>> Error >>> Signer doesn't have OPERATOR_ROLE");
            return;
        }
        
        console.log(">>> Operator role confirmed >>> ✓");
        
        console.log(">>> Setting FeeManager...");
        const tx = await krwinContract.setFeeManager(feeManagerAddress);
        await tx.wait();
        
        console.log(">>> FeeManager set successfully >>> ✓");
        console.log(`>>> Transaction hash >>> ${tx.hash}`);
        
        // 확인
        const currentFeeManager = await krwinContract.feeManager();
        console.log(`>>> Verified FeeManager >>> ${currentFeeManager}`);
        
    } catch (error) {
        console.error(">>> Error setting FeeManager >>>", error.message);
        console.error(">>> Full error >>>", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 