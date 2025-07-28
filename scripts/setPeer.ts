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
    
    console.log(`\n>>> Setting Peer on ${networkConfig.name} >>>`);
    console.log(`>>> Contract address >>> ${networkConfig.contractAddress}`);
    
    try {
        const contract = await ethers.getContractAt(CONTRACT_CONFIG.name, networkConfig.contractAddress);
        
        const currentOwner = await contract.owner();
        console.log(">>> Current owner >>>", currentOwner);
        
        if (currentOwner !== signer.address) {
            console.error(">>> Error >>> Signer is not the owner");
            return;
        }
        
        console.log(">>> Owner confirmed >>> YAY!");
        
        const sepoliaEid = NETWORKS[11155111].eid;
        const baseEid = NETWORKS[84532].eid;
        
        if (network.chainId === 11155111) { // Sepolia
            const baseContractAddress = NETWORKS[84532].contractAddress;
            const peerBytes32 = ethers.utils.hexZeroPad(baseContractAddress, 32);
            
            console.log(`>>> Setting peer for Base (${baseEid}) >>> ${baseContractAddress}`);
            console.log(`>>> Peer bytes32 >>> ${peerBytes32}`);
            
            const tx = await contract.setPeer(baseEid, peerBytes32);
            await tx.wait();
            
            console.log(">>> Peer set successfully >>> YAY!");
            console.log(`>>> Transaction hash >>> ${tx.hash}`);
            
            // 확인
            const peer = await contract.peers(baseEid);
            console.log(`>>> Verified peer >>> ${peer}`);
            
        } else if (network.chainId === 84532) { // Base Sepolia
            const sepoliaContractAddress = NETWORKS[11155111].contractAddress;
            const peerBytes32 = ethers.utils.hexZeroPad(sepoliaContractAddress, 32);
            
            console.log(`>>> Setting peer for Sepolia (${sepoliaEid}) >>> ${sepoliaContractAddress}`);
            console.log(`>>> Peer bytes32 >>> ${peerBytes32}`);
            
            const tx = await contract.setPeer(sepoliaEid, peerBytes32);
            await tx.wait();
            
            console.log(">>> Peer set successfully >>> YAY!");
            console.log(`>>> Transaction hash >>> ${tx.hash}`);
            
            // 확인
            const peer = await contract.peers(sepoliaEid);
            console.log(`>>> Verified peer >>> ${peer}`);
            
        } else {
            console.error(`>>> Unsupported network >>> ${network.chainId}`);
        }
        
    } catch (error) {
        console.error(">>> Error setting peer >>>", error.message);
        console.error(">>> Full error >>>", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 