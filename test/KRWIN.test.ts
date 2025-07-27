import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers, upgrades } from 'hardhat'

// TypeScript 타입 정의 추가
declare global {
    namespace Chai {
        interface Assertion {
            revertedWithCustomError(contract: any, errorName: string): Assertion
        }
    }
}

describe('KRWIN Test', () => {
    // Constant representing a mock Endpoint ID for testing purposes
    const eidA = 1
    const eidB = 2
    
    // Declaration of variables to be used in the test suite
    let KRWIN: ContractFactory
    let FeeManager: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ownerA: SignerWithAddress
    let ownerB: SignerWithAddress
    let user: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let krwinA: Contract
    let krwinB: Contract
    let feeManagerA: Contract
    let feeManagerB: Contract
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    before(async function () {
        KRWIN = await ethers.getContractFactory('KRWIN')
        FeeManager = await ethers.getContractFactory('FeeManager')

        // Fetching the first four signers (accounts) from Hardhat's local Ethereum network
        const signers = await ethers.getSigners()
        ;[ownerA, ownerB, user, endpointOwner] = signers

        // The EndpointV2Mock contract comes from @layerzerolabs/test-devtools-evm-hardhat package
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner)
    })

    // beforeEach hook for setup that runs before each test in the block
    beforeEach(async function () {
        // Deploying a mock LZEndpoint with the given Endpoint ID
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA)
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB)

        // Deploying FeeManager contracts
        feeManagerA = await upgrades.deployProxy(FeeManager, [], {
            initializer: 'initialize',
            unsafeAllow: ['constructor'],
        })
        await feeManagerA.initialize(
            '0x0000000000000000000000000000000000000000', // placeholder for KRWIN address
            ownerA.address, // LP Receiver
            ownerA.address  // Treasury Receiver
        )

        feeManagerB = await upgrades.deployProxy(FeeManager, [], {
            initializer: 'initialize',
            unsafeAllow: ['constructor'],
        })
        await feeManagerB.initialize(
            '0x0000000000000000000000000000000000000000', // placeholder for KRWIN address
            ownerB.address, // LP Receiver
            ownerB.address  // Treasury Receiver
        )

        // Deploying two instances of KRWIN contract with different identifiers and linking them to the mock LZEndpoint
        krwinA = await upgrades.deployProxy(KRWIN, [], {
            initializer: 'initialize',
            constructorArgs: [mockEndpointV2A.address],
            unsafeAllow: ['constructor', 'state-variable-immutable'],
        })
        await krwinA.initialize('KRWIN Stablecoin', 'KRWIN', ownerA.address, ownerA.address)

        krwinB = await upgrades.deployProxy(KRWIN, [], {
            initializer: 'initialize',
            constructorArgs: [mockEndpointV2B.address],
            unsafeAllow: ['constructor', 'state-variable-immutable'],
        })
        await krwinB.initialize('KRWIN Stablecoin', 'KRWIN', ownerB.address, ownerB.address)

        // Setting destination endpoints in the LZEndpoint mock for each KRWIN instance
        await mockEndpointV2A.setDestLzEndpoint(krwinB.address, mockEndpointV2B.address)
        await mockEndpointV2B.setDestLzEndpoint(krwinA.address, mockEndpointV2A.address)

        // Update FeeManager with actual KRWIN addresses
        await feeManagerA.initialize(krwinA.address, ownerA.address, ownerA.address)
        await feeManagerB.initialize(krwinB.address, ownerB.address, ownerB.address)

        // Set FeeManager in KRWIN contracts
        await krwinA.setFeeManager(feeManagerA.address)
        await krwinB.setFeeManager(feeManagerB.address)
    })

    describe('Basic Functionality', () => {
        it('should initialize correctly', async () => {
            expect(await krwinA.name()).to.equal('KRWIN Stablecoin')
            expect(await krwinA.symbol()).to.equal('KRWIN')
            expect(await krwinA.decimals()).to.equal(18)
        })

        it('should have correct roles', async () => {
            const MINTER_ROLE = await krwinA.MINTER_ROLE()
            const OPERATOR_ROLE = await krwinA.OPERATOR_ROLE()
            const DEFAULT_ADMIN_ROLE = await krwinA.DEFAULT_ADMIN_ROLE()

            expect(await krwinA.hasRole(MINTER_ROLE, ownerA.address)).to.be.true
            expect(await krwinA.hasRole(OPERATOR_ROLE, ownerA.address)).to.be.true
            expect(await krwinA.hasRole(DEFAULT_ADMIN_ROLE, ownerA.address)).to.be.true
        })

        it('should mint tokens correctly', async () => {
            const mintAmount = ethers.utils.parseEther('1000')
            await krwinA.mint(user.address, mintAmount)
            
            expect(await krwinA.balanceOf(user.address)).to.equal(mintAmount)
            expect(await krwinA.totalSupply()).to.equal(mintAmount)
        })

        it('should burn tokens correctly', async () => {
            const mintAmount = ethers.utils.parseEther('1000')
            const burnAmount = ethers.utils.parseEther('500')
            
            await krwinA.mint(user.address, mintAmount)
            await krwinA.connect(user).burn(burnAmount)
            
            expect(await krwinA.balanceOf(user.address)).to.equal(mintAmount.sub(burnAmount))
            expect(await krwinA.totalSupply()).to.equal(mintAmount.sub(burnAmount))
        })
    })

    describe('Fee Management', () => {
        it('should set and get fees correctly', async () => {
            const newMintFee = 100 // 1%
            const newBurnFee = 200 // 2%
            
            await krwinA.setMintFee(newMintFee)
            await krwinA.setBurnFee(newBurnFee)
            
            expect(await krwinA.mintFee()).to.equal(newMintFee)
            expect(await krwinA.burnFee()).to.equal(newBurnFee)
        })

        it('should reject fees that are too high', async () => {
            const tooHighFee = 501 // 5.01% > 5%
            
            await expect(krwinA.setMintFee(tooHighFee)).to.be.revertedWith('FeeTooHigh')
            await expect(krwinA.setBurnFee(tooHighFee)).to.be.revertedWith('FeeTooHigh')
        })

        it('should set fee manager correctly', async () => {
            expect(await krwinA.feeManager()).to.equal(feeManagerA.address)
        })
    })

    describe('Blacklist and Freeze', () => {
        it('should blacklist and freeze accounts', async () => {
            await krwinA.addToBlacklist(user.address)
            await krwinA.freezeAccount(user.address)
            
            expect(await krwinA.isBlacklisted(user.address)).to.be.true
            expect(await krwinA.isFrozen(user.address)).to.be.true
            expect(await krwinA.isBlocked(user.address)).to.be.true
        })

        it('should prevent blocked accounts from minting', async () => {
            await krwinA.addToBlacklist(user.address)
            
            await expect(krwinA.mint(user.address, 100)).to.be.revertedWith('BlockedRecipient')
        })

        it('should prevent blocked accounts from burning', async () => {
            await krwinA.mint(user.address, 1000)
            await krwinA.addToBlacklist(user.address)
            
            await expect(krwinA.connect(user).burn(100)).to.be.revertedWith('BlockedSender')
        })
    })

    describe('Pause Functionality', () => {
        it('should pause and unpause correctly', async () => {
            expect(await krwinA.isPaused()).to.be.false
            
            await krwinA.pause()
            expect(await krwinA.isPaused()).to.be.true
            
            await krwinA.unpause()
            expect(await krwinA.isPaused()).to.be.false
        })

        it('should prevent minting when paused', async () => {
            await krwinA.pause()
            
            await expect(krwinA.mint(user.address, 100)).to.be.revertedWith('Pausable: paused')
        })

        it('should prevent burning when paused', async () => {
            await krwinA.mint(user.address, 1000)
            await krwinA.pause()
            
            await expect(krwinA.connect(user).burn(100)).to.be.revertedWith('Pausable: paused')
        })
    })

    describe('Transfer Limits', () => {
        it('should set transfer limits correctly', async () => {
            const limitConfig = {
                limitType: 0, // Daily
                limit: ethers.utils.parseEther('1000'),
                resetTime: 86400 // 24 hours
            }
            
            await krwinA.setTransferLimitConfigs([limitConfig])
            
            // Verify the limit was set (implementation depends on your TransferLimiter module)
        })
    })

    describe('Cross-chain Communication', () => {
        it('should set peers correctly', async () => {
            const peerBytes32 = ethers.utils.hexZeroPad(krwinB.address, 32)
            
            await krwinA.setPeer(eidB, peerBytes32)
            
            const storedPeer = await krwinA.peers(eidB)
            expect(storedPeer).to.equal(peerBytes32)
        })

        it('should only allow owner to set peers', async () => {
            const peerBytes32 = ethers.utils.hexZeroPad(krwinB.address, 32)
            
            await expect(krwinA.connect(user).setPeer(eidB, peerBytes32)).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })

    describe('Upgradeability', () => {
        it('should upgrade correctly', async () => {
            // Deploy a new implementation
            const KRWINV2 = await ethers.getContractFactory('KRWIN')
            const krwinV2 = await upgrades.upgradeProxy(krwinA.address, KRWINV2, {
                constructorArgs: [mockEndpointV2A.address],
                unsafeAllow: ['constructor', 'state-variable-immutable'],
            })

            // Verify the upgrade didn't break basic functionality
            expect(await krwinV2.name()).to.equal('KRWIN Stablecoin')
            expect(await krwinV2.symbol()).to.equal('KRWIN')
        })
    })
}) 