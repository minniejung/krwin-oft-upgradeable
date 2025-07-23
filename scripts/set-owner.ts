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
    
    console.log(`\n=== Setting Owner and Roles for ${networkName} ===`);
    console.log(`Contract: ${contractAddress}`);
    
    try {
        // 컨트랙트 인스턴스 생성
        const contractFactory = await ethers.getContractFactory("SimpleOFTUpgradeable");
        const contract = await ethers.getContractAt(contractFactory.interface, contractAddress);
        
        // 현재 owner 확인
        try {
            const currentOwner = await contract.owner();
            console.log("Current owner:", currentOwner);
        } catch (error) {
            console.log("Owner function not available or error:", error.message);
        }
        
        // 현재 권한 확인
        const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
        const MINTER_ROLE = await contract.MINTER_ROLE();
        
        const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
        const hasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address);
        
        console.log("Signer has DEFAULT_ADMIN_ROLE:", hasAdminRole);
        console.log("Signer has MINTER_ROLE:", hasMinterRole);
        
        if (!hasAdminRole) {
            console.error("Signer does not have DEFAULT_ADMIN_ROLE!");
            return;
        }
        
        // 1. transferOwnership 호출
        console.log("\n1. Setting owner to signer address...");
        const ownerTx = await contract.transferOwnership(signer.address);
        console.log("Owner transaction hash:", ownerTx.hash);
        await ownerTx.wait();
        console.log("Owner set successfully!");
        
        // 2. DEFAULT_ADMIN_ROLE 확인 및 설정
        console.log("\n2. Checking DEFAULT_ADMIN_ROLE...");
        const newOwner = await contract.owner();
        console.log("New owner:", newOwner);
        
        // DEFAULT_ADMIN_ROLE이 이미 설정되어 있는지 확인
        const finalHasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
        console.log("Signer has DEFAULT_ADMIN_ROLE:", finalHasAdminRole);
        
        if (!finalHasAdminRole) {
            console.log("Granting DEFAULT_ADMIN_ROLE to signer...");
            const adminTx = await contract.grantRole(DEFAULT_ADMIN_ROLE, signer.address);
            console.log("Admin role transaction hash:", adminTx.hash);
            await adminTx.wait();
            console.log("DEFAULT_ADMIN_ROLE granted successfully!");
        } else {
            console.log("DEFAULT_ADMIN_ROLE already granted to signer");
        }
        
        // 3. MINTER_ROLE 확인 및 설정
        console.log("\n3. Checking MINTER_ROLE...");
        const finalHasMinterRole = await contract.hasRole(MINTER_ROLE, signer.address);
        console.log("Signer has MINTER_ROLE:", finalHasMinterRole);
        
        if (!finalHasMinterRole) {
            console.log("Granting MINTER_ROLE to signer...");
            const minterTx = await contract.grantRole(MINTER_ROLE, signer.address);
            console.log("Minter role transaction hash:", minterTx.hash);
            await minterTx.wait();
            console.log("MINTER_ROLE granted successfully!");
        } else {
            console.log("MINTER_ROLE already granted to signer");
        }
        
        // 최종 확인
        console.log("\n=== Final Status ===");
        const finalOwner = await contract.owner();
        const finalAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
        const finalMinterRole = await contract.hasRole(MINTER_ROLE, signer.address);
        
        console.log("Final owner:", finalOwner);
        console.log("Signer has DEFAULT_ADMIN_ROLE:", finalAdminRole);
        console.log("Signer has MINTER_ROLE:", finalMinterRole);
        
    } catch (error) {
        console.error("Error setting owner and roles:", error.message);
        console.error("Full error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });