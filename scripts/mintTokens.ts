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
    
    console.log(`\n>>> Minting Tokens on ${networkConfig.name} >>>`);
    console.log(`>>> Contract address >>> ${networkConfig.contractAddress}`);
    
    try {
        const contract = await ethers.getContractAt(CONTRACT_CONFIG.name, networkConfig.contractAddress);
        
        const MINTER_ROLE = await contract.MINTER_ROLE();
        const hasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address);
        
        if (!hasMinterRole) {
            console.error(">>> Error >>> Signer does not have MINTER_ROLE");
            return;
        }
        
        console.log(">>> Minter role confirmed >>> YAY");
        
        const mintAmount = ethers.utils.parseEther("1000");
        console.log(`>>> Minting amount >>> ${ethers.utils.formatEther(mintAmount)} ${CONTRACT_CONFIG.tokenSymbol}`);
        
        const tx = await contract.mint(signer.address, mintAmount);
        await tx.wait();
        
        console.log(">>> Minting successful >>> YAY");
        console.log(`>>> Transaction hash >>> ${tx.hash}`);
        
        const newBalance = await contract.balanceOf(signer.address);
        console.log(`>>> New balance >>> ${ethers.utils.formatEther(newBalance)} ${CONTRACT_CONFIG.tokenSymbol}`);
        
    } catch (error) {
        console.error(">>> Error minting tokens >>>", error.message);
        console.error(">>> Full error >>>", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 