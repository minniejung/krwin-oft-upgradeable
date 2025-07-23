import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);
    
    const network = await ethers.provider.getNetwork();
    console.log("Network chainId:", network.chainId);
    
    // 네트워크별 컨트랙트 주소
    const contractAddresses: { [chainId: number]: string } = {
        11155111: "0x2094F2bc1DB87E1Ac31Cc2bF895411E3098cBf2a", // Sepolia
        84532: "0x65CB65FAc23443F5d0BB1F350BcC11A3638645d5", // Base Sepolia
    };
    
    const networkNames: { [chainId: number]: string } = {
        11155111: "Sepolia",
        84532: "Base Sepolia",
    };
    
    const contractAddress = contractAddresses[network.chainId];
    const networkName = networkNames[network.chainId];
    
    if (!contractAddress) {
        console.error(`No contract address configured for chainId: ${network.chainId}`);
        return;
    }
    
    console.log(`\n=== Minting Tokens on ${networkName} ===`);
    console.log(`Contract: ${contractAddress}`);
    
    try {
        // 컨트랙트 인스턴스 생성
        const contractFactory = await ethers.getContractFactory("SimpleOFTUpgradeable");
        const contract = await ethers.getContractAt(contractFactory.interface, contractAddress);
        
        // 권한 확인
        const MINTER_ROLE = await contract.MINTER_ROLE();
        const hasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address);
        
        console.log("Signer has MINTER_ROLE:", hasMinterRole);
        
        if (!hasMinterRole) {
            console.error("Signer does not have MINTER_ROLE!");
            return;
        }
        
        // 현재 잔액 확인
        const currentBalance = await contract.balanceOf(signer.address);
        console.log("Current balance:", ethers.utils.formatEther(currentBalance));
        
        // 민팅할 양 (1,000 STBL)
        const mintAmount = ethers.utils.parseEther("1000");
        console.log("Minting amount:", ethers.utils.formatEther(mintAmount));
        
        // 토큰 민팅
        console.log("Minting tokens...");
        const tx = await contract.mint(signer.address, mintAmount);
        console.log("Transaction hash:", tx.hash);
        
        await tx.wait();
        console.log("Tokens minted successfully!");
        
        // 새로운 잔액 확인
        const newBalance = await contract.balanceOf(signer.address);
        console.log("New balance:", ethers.utils.formatEther(newBalance));
        
        // 총 공급량 확인
        const totalSupply = await contract.totalSupply();
        console.log("Total supply:", ethers.utils.formatEther(totalSupply));
        
    } catch (error) {
        console.error("Error minting tokens:", error.message);
        console.error("Full error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 