import { expect } from 'chai'
import { ethers } from 'hardhat'
import { contract, contractFromSigner2, signer, signer2, feeManagerContract } from '../utils/consts/test.const'

describe('Burn logic', () => {
    let recoveryRole: string
    let hasOperatorRole: boolean

    before(async () => {
        recoveryRole = await contract.FUNDS_RECOVERY_ROLE()
        console.log('>>> Recovery role >>>', { recoveryRole })

        // Check if signer has OPERATOR_ROLE
        // const OPERATOR_ROLE = await contract.OPERATOR_ROLE()
        // hasOperatorRole = await contract.hasRole(OPERATOR_ROLE, signer.address)
        // console.log('>>> Operator role check >>>', { 
        //     signer: signer.address, 
        //     hasRole: hasOperatorRole 
        // })

        // const setFeeManager = await contract.setFeeManager(feeManagerContract.address)
        // await setFeeManager.wait()
        console.log('>>> Set fee manager >>>', feeManagerContract.address)

        // Set burn fee to 1% for testing (only if has permission)
        // if (hasOperatorRole) {
        //     await contract.setBurnFee(100)
        //     console.log('>>> Set burn fee to 1% >>>')
        // } else {
        //     console.log('>>> No OPERATOR_ROLE, skipping burn fee set >>>')
        // }
    })

    after(async () => {
        const isBlocked = await contract.isBlocked(signer2.address)
        if (isBlocked) {
            await contract.removeFromBlacklist(signer2.address)
        }
        // Reset burn fee to 0 (only if has permission)
        // if (hasOperatorRole) {
        //     await contract.setBurnFee(0)
        // }
    })

    it('should burn tokens and apply burn fee', async () => {
        const burnAmount = 1000

        // Mint tokens to signer2 first
        console.log('>>> Minting tokens to signer2 >>>')
        const mintTx = await contract.mint(signer2.address, 10000)
        await mintTx.wait()

        const balanceBeforeBurn = await contract.balanceOf(signer2.address)
        console.log('>>> Balance before burn >>>', { balance: balanceBeforeBurn.toString() })

        const burnFee = await contract.burnFee()
        console.log('>>> Burn fee >>>', { burnFee: burnFee.toString() })
        const expectedFee = Math.floor((burnAmount * Number(burnFee)) / 10000)
        console.log('>>> Expected fee >>>', { expectedFee })

        console.log('>>> Burning tokens >>>')
        const tx = await contractFromSigner2.burn(burnAmount)
        const receipt = await tx.wait()

        const balanceAfterBurn = await contract.balanceOf(signer2.address)
        console.log('>>> Balance after burn >>>', { balance: balanceAfterBurn.toString() })

        const burnLogs = await contract.queryFilter('BurnFeePaid', receipt.blockNumber, receipt.blockNumber)
        console.log('>>> Found burn logs >>>', burnLogs.length)
        burnLogs.forEach((log, index) => {
            console.log(`>>> Log ${index} >>>`, log.args)
        })

        expect(burnLogs.length).to.be.greaterThan(0)
        
        // Verify the fee was paid correctly
        if (burnLogs.length > 0) {
            const feeFromEvent = BigInt(burnLogs[burnLogs.length - 1]?.args?.fee?.toString() || '0')
            console.log('>>> Fee from event >>>', { feeFromEvent: feeFromEvent.toString() })
            expect(feeFromEvent).to.equal(BigInt(expectedFee))
        }
    })

    it('should allow burnFrom with sufficient allowance', async () => {
        const balanceBefore = await contract.balanceOf(signer2.address)
        const allowanceBefore = await contract.allowance(signer2.address, signer.address)
        console.log('>>> Initial state >>>', {
            balance: balanceBefore.toString(),
            allowance: allowanceBefore.toString(),
        })

        await contractFromSigner2.approve(signer.address, 300)
        const allowance = await contract.allowance(signer2.address, signer.address)
        console.log('>>> New allowance >>>', { allowance: allowance.toString() })

        const tx = await contract.burnFrom(signer2.address, 200)
        await tx.wait()

        const balanceAfter = await contract.balanceOf(signer2.address)
        const allowanceAfter = await contract.allowance(signer2.address, signer.address)
        console.log('>>> Final state >>>', {
            balance: balanceAfter.toString(),
            allowance: allowanceAfter.toString(),
        })

        expect(balanceBefore.sub(balanceAfter)).to.equal(200n)
        expect(allowanceBefore.sub(allowanceAfter)).to.equal(200n)
    })

    it.only('should destroy blocked funds', async () => {
        const isRecoveryer = await contract.hasRole(recoveryRole, signer.address)
        console.log('>>> Is recovery role >>>', { signer: signer.address, isRecoveryer })

        // console.log('>>> Unblacklisting signer2 >>>')
        // const unblockedUser = await contract.removeFromBlacklist(signer2.address)
        // await unblockedUser.wait()

        // const isBlocked = await contract.isBlocked(signer2.address)
        // console.log('>>> Is blocked >>>', { signer2: signer2.address, isBlocked })

        // console.log('>>> Minting tokens to signer2 >>>')
        // const mintTo = await contract.mint(signer2.address, 500)
        // await mintTo.wait()

        const balanceBefore = await contract.balanceOf(signer2.address)
        console.log('>>> Balance before blocking >>>', { balance: balanceBefore.toString() })

        const blockedUser = await contract.addToBlacklist(signer2.address)
        await blockedUser.wait()

        console.log('>>> Is blocked >>>', { signer2: signer2.address, blockedUser })

        const tx = await contract.destroyBlockedFunds(signer2.address)
        const receipt = await tx.wait()

        const balanceAfter = await contract.balanceOf(signer2.address)
        console.log('>>> Balance after destruction >>>', { balance: balanceAfter.toString() })
        expect(balanceAfter).to.equal(0)

        const destroyedLogs = await contract.queryFilter('BlockedFundsDestroyed', receipt.blockNumber, receipt.blockNumber)
        console.log('>>> Destroyed logs >>>', destroyedLogs.length)
        destroyedLogs.forEach((log, index) => {
            console.log(`>>> Log ${index} >>>`, log.args)
        })
        expect(destroyedLogs.length).to.be.greaterThan(0)

        console.log('>>> Unblacklisting signer2 >>>')
        await contract.removeFromBlacklist(signer2.address)
    })
})
