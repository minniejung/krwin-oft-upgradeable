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
    
    console.log(`\n=== Balance Check on ${networkName} ===`);
    console.log(`Contract: ${contractAddress}`);
    
    try {
        // 컨트랙트 인스턴스 생성
        const contractFactory = await ethers.getContractFactory("SimpleOFTUpgradeable");
        const contract = await ethers.getContractAt(contractFactory.interface, contractAddress);
        
        // 기본 정보
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        
        console.log("Token name:", name);
        console.log("Token symbol:", symbol);
        console.log("Decimals:", decimals);
        
        // 잔액 정보
        const balance = await contract.balanceOf(signer.address);
        const totalSupply = await contract.totalSupply();
        
        console.log("\n=== Balance Information ===");
        console.log("Your balance:", ethers.utils.formatEther(balance), symbol);
        console.log("Total supply:", ethers.utils.formatEther(totalSupply), symbol);
        
        // 권한 정보
        const MINTER_ROLE = await contract.MINTER_ROLE();
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
        
        const hasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address);
        const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
        
        console.log("\n=== Role Information ===");
        console.log("Has MINTER_ROLE:", hasMinterRole);
        console.log("Has DEFAULT_ADMIN_ROLE:", hasAdminRole);
        
        // Owner 정보
        try {
            const owner = await contract.owner();
            console.log("Contract owner:", owner);
        } catch (error) {
            console.log("Owner function not available");
        }
        
        // Endpoint 정보
        const endpoint = await contract.endpoint();
        console.log("Endpoint:", endpoint);
        
        // Peer 정보 (크로스체인 연결 확인)
        try {
            const sepoliaEid = 40161;
            const baseEid = 40245;
            
            if (network.chainId === 11155111) { // Sepolia
                const peer = await contract.peers(baseEid);
                console.log(`Peer for Base (${baseEid}):`, peer);
            } else if (network.chainId === 84532) { // Base
                const peer = await contract.peers(sepoliaEid);
                console.log(`Peer for Sepolia (${sepoliaEid}):`, peer);
            }
        } catch (error) {
            console.log("Peer information not available:", error.message);
        }
        
    } catch (error) {
        console.error("Error checking balance:", error.message);
        console.error("Full error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 