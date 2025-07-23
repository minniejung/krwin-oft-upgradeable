import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);
    
    const network = await ethers.provider.getNetwork();
    console.log("Network chainId:", network.chainId);
    
    // 네트워크별 컨트랙트 주소 매핑
    const contractAddresses: { [chainId: number]: string } = {
        11155111: "0x2094F2bc1DB87E1Ac31Cc2bF895411E3098cBf2a", // Sepolia (새 주소)
        84532: "0x65CB65FAc23443F5d0BB1F350BcC11A3638645d5", // Base Sepolia (새 주소)
    };
    
    // 네트워크별 이름 매핑
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
    
    console.log(`\n=== Debug ${networkName} Contract State ===`);
    console.log(`Contract address: ${contractAddress}`);
    
    try {
        // ABI를 명시적으로 가져오기
        const contractFactory = await ethers.getContractFactory("SimpleOFTUpgradeable");
        const contract = await ethers.getContractAt(contractFactory.interface, contractAddress);
        
        // 기본 정보 확인
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const totalSupply = await contract.totalSupply();
        
        console.log("Token name:", name);
        console.log("Token symbol:", symbol);
        console.log("Decimals:", decimals);
        console.log("Total supply:", totalSupply.toString());
        
        // 권한 확인
        const MINTER_ROLE = await contract.MINTER_ROLE();
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
        
        console.log("MINTER_ROLE:", MINTER_ROLE);
        console.log("DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
        
        const hasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address);
        const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
        
        console.log("Signer has MINTER_ROLE:", hasMinterRole);
        console.log("Signer has DEFAULT_ADMIN_ROLE:", hasAdminRole);
        
        // Endpoint 확인
        const endpoint = await contract.endpoint();
        console.log("Endpoint:", endpoint);
        
        // 컨트랙트 소유자 확인
        try {
            const owner = await contract.owner();
            console.log("Contract owner:", owner);
        } catch (error) {
            console.log("Owner function not available - using DEFAULT_ADMIN_ROLE instead");
            
            const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
            const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
            console.log("Signer is DEFAULT_ADMIN_ROLE:", hasAdminRole);
            console.log("Actual admin address:", signer.address);
        }
        
    } catch (error) {
        console.error("Error debugging contract:", error.message);
        console.error("Full error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 