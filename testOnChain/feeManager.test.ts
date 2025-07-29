import { expect } from 'chai'
import { ethers } from 'hardhat'
import { contract, feeManagerContract, wallet3, wallet4 } from '../utils/consts/test.const'

describe('FeeManager contract', () => {
    let token: string
    let lpReceiver: string
    let treasuryReceiver: string

    before(async () => {
        token = contract.address
        lpReceiver = await feeManagerContract.lpReceiver()
        treasuryReceiver = await feeManagerContract.treasuryReceiver()
    })

    after(async () => {
        await feeManagerContract.updateShares(0, 10000)
        await feeManagerContract.updateReceivers(lpReceiver, treasuryReceiver)
    })

    it('should return correct fee split from getFeeSplit()', async () => {
        await (await feeManagerContract.updateShares(4000, 6000)).wait()
        const [lpAmount, treasuryAmount] = await feeManagerContract.getFeeSplit(10000)
        expect(lpAmount).to.equal(4000)
        expect(treasuryAmount).to.equal(6000)
    })

    it('should revert when updating shares with invalid total', async () => {
        const invalidShares = [
            [6000, 3000], // 9000 total
            [7000, 4000], // 11000 total
            [10000, 1000], // 11000 total
            [5000, 6000]  // 11000 total
        ]

        for (const [lpShare, treasuryShare] of invalidShares) {
            try {
                await feeManagerContract.updateShares(lpShare, treasuryShare)
                expect.fail(`Should have reverted for shares ${lpShare}, ${treasuryShare}`)
            } catch (error: any) {
                expect(error.message).to.include('revert')
            }
        }
    })

    it('should update receivers', async () => {
        await (await feeManagerContract.updateReceivers(wallet3, wallet4)).wait()
        const updatedLP = await feeManagerContract.lpReceiver()
        const updatedTreasury = await feeManagerContract.treasuryReceiver()
        
        expect(updatedLP.toLowerCase()).to.equal(wallet3.toLowerCase())
        expect(updatedTreasury.toLowerCase()).to.equal(wallet4.toLowerCase())
    })

    it('should revert when updating receivers with zero addresses', async () => {
        const zeroAddress = '0x0000000000000000000000000000000000000000'
        
        try {
            await feeManagerContract.updateReceivers(zeroAddress, wallet4)
            expect.fail('Should have reverted with zero LP address')
        } catch (error: any) {
            expect(error.message).to.include('revert')
        }

        try {
            await feeManagerContract.updateReceivers(wallet3, zeroAddress)
            expect.fail('Should have reverted with zero treasury address')
        } catch (error: any) {
            expect(error.message).to.include('revert')
        }
    })

    it('should update shares correctly', async () => {
        await (await feeManagerContract.updateShares(4000, 6000)).wait()
        const lp = await feeManagerContract.lpShare()
        const treasury = await feeManagerContract.treasuryShare()
        expect(lp).to.equal(4000)
        expect(treasury).to.equal(6000)

        await feeManagerContract.updateShares(0, 10000)
    })

    it('should emit ReceiversUpdated event', async () => {
        const currentBlock = await ethers.provider.getBlockNumber()
        
        await (await feeManagerContract.updateReceivers(wallet3, wallet4)).wait()
        
        const logs = await feeManagerContract.queryFilter('ReceiversUpdated', currentBlock)
        expect(logs.length).to.be.greaterThan(0)
        
        const event = logs[logs.length - 1]
        expect(event?.args?.lp.toLowerCase()).to.equal(wallet3.toLowerCase())
        expect(event?.args?.treasury.toLowerCase()).to.equal(wallet4.toLowerCase())
    })

    it('should emit SharesUpdated event', async () => {
        const currentBlock = await ethers.provider.getBlockNumber()
        
        await (await feeManagerContract.updateShares(3000, 7000)).wait()
        
        const logs = await feeManagerContract.queryFilter('SharesUpdated', currentBlock)
        expect(logs.length).to.be.greaterThan(0)
        
        const event = logs[logs.length - 1]
        expect(event?.args?.lpShare).to.equal(3000)
        expect(event?.args?.treasuryShare).to.equal(7000)
    })

    it('should handle edge cases for fee split calculation', async () => {
        // Test with 0 amount
        await (await feeManagerContract.updateShares(5000, 5000)).wait()
        const [lpAmount0, treasuryAmount0] = await feeManagerContract.getFeeSplit(0)
        expect(lpAmount0).to.equal(0)
        expect(treasuryAmount0).to.equal(0)

        // Test with 1 amount
        const [lpAmount1, treasuryAmount1] = await feeManagerContract.getFeeSplit(1)
        expect(lpAmount1).to.equal(0) // 1 * 5000 / 10000 = 0
        expect(treasuryAmount1).to.equal(1)

        // Test with large amount
        const largeAmount = ethers.utils.parseEther('1000000')
        const [lpAmountLarge, treasuryAmountLarge] = await feeManagerContract.getFeeSplit(largeAmount)
        expect(lpAmountLarge).to.equal(largeAmount.mul(5000).div(10000))
        expect(treasuryAmountLarge).to.equal(largeAmount.sub(lpAmountLarge))
    })

    it('should maintain correct state after multiple operations', async () => {
        console.log(">>> Starting multiple operations test >>>")
        
        // Initial state
        let lpShare = await feeManagerContract.lpShare()
        let treasuryShare = await feeManagerContract.treasuryShare()
        console.log(">>> Initial shares >>>", { 
            lpShare: lpShare.toString(), 
            treasuryShare: treasuryShare.toString(), 
            total: lpShare.add(treasuryShare).toString() 
        })
        expect(lpShare.add(treasuryShare)).to.equal(10000)

        // Update shares
        console.log(">>> Updating shares to 2000/8000 >>>")
        await (await feeManagerContract.updateShares(2000, 8000)).wait()
        lpShare = await feeManagerContract.lpShare()
        treasuryShare = await feeManagerContract.treasuryShare()
        console.log(">>> Updated shares >>>", { 
            lpShare: lpShare.toString(), 
            treasuryShare: treasuryShare.toString(), 
            total: lpShare.add(treasuryShare).toString() 
        })
        expect(lpShare).to.equal(2000)
        expect(treasuryShare).to.equal(8000)
        expect(lpShare.add(treasuryShare)).to.equal(10000)

        // Update receivers
        console.log(">>> Updating receivers >>>")
        await (await feeManagerContract.updateReceivers(wallet3, wallet4)).wait()
        const lpReceiver = await feeManagerContract.lpReceiver()
        const treasuryReceiver = await feeManagerContract.treasuryReceiver()
        console.log(">>> Updated receivers >>>", { lpReceiver, treasuryReceiver })
        expect(lpReceiver.toLowerCase()).to.equal(wallet3.toLowerCase())
        expect(treasuryReceiver.toLowerCase()).to.equal(wallet4.toLowerCase())

        // Verify shares still correct
        lpShare = await feeManagerContract.lpShare()
        treasuryShare = await feeManagerContract.treasuryShare()
        console.log(">>> Final shares >>>", { 
            lpShare: lpShare.toString(), 
            treasuryShare: treasuryShare.toString(), 
            total: lpShare.add(treasuryShare).toString() 
        })
        expect(lpShare.add(treasuryShare)).to.equal(10000)
        
        console.log(">>> Test completed successfully >>>")
    })


})
