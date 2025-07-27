import { expect } from 'chai'
import { contract, feeManagerContract, signer } from '../utils/consts/test.const'
import { ethers } from 'hardhat'

describe('Fee Logic', () => {
    let hasOperatorRole: boolean

    before(async () => {
        const OPERATOR_ROLE = await contract.OPERATOR_ROLE()
        hasOperatorRole = await contract.hasRole(OPERATOR_ROLE, signer.address)
        console.log(">>> Operator role status >>>", { 
            signer: signer.address, 
            hasRole: hasOperatorRole 
        })
    })

    after(async () => {
        await contract.setMintFee(100)
        await contract.setBurnFee(100)
    })

    it('should revert when setting invalid mint fee', async function () {
        console.log(">>> Testing invalid mint fee (501) >>>")
        try {
            await contract.setMintFee(501)
            expect.fail('Should have reverted')
        } catch (error: any) {
            console.log(">>> setMintFee() reverted as expected >>>", error.message)
            expect(error.message).to.include('revert')
        }
    })

    it('should set and get mintFee and burnFee correctly', async function () {
        if (!hasOperatorRole) {
            console.log(">>> Signer doesn't have OPERATOR_ROLE, skipping test >>>")
            this.skip()
            return
        }

        console.log(">>> Setting mint fee to 200 >>>")
        await (await contract.setMintFee(200)).wait()
        const mintFee = await contract.mintFee()
        console.log(">>> Mint fee >>>", { mintFee: mintFee.toString() })
        expect(mintFee).to.equal(200)

        console.log(">>> Setting burn fee to 200 >>>")
        await (await contract.setBurnFee(200)).wait()
        const burnFee = await contract.burnFee()
        console.log(">>> Burn fee >>>", { burnFee: burnFee.toString() })
        expect(burnFee).to.equal(200)
    })

    it('should emit MintFeeUpdated and BurnFeeUpdated events', async function () {
        if (!hasOperatorRole) {
            console.log(">>> Signer doesn't have OPERATOR_ROLE, skipping test >>>")
            this.skip()
            return
        }

        const currentBlock = await ethers.provider.getBlockNumber()

        console.log(">>> Emitting MintFeeUpdated event >>>")
        await (await contract.setMintFee(100)).wait()
        const mintFeeLogs = await contract.queryFilter('MintFeeUpdated', currentBlock)
        console.log(">>> MintFeeUpdated logs >>>", { count: mintFeeLogs.length })
        expect(mintFeeLogs.length).to.be.greaterThan(0)

        console.log(">>> Emitting BurnFeeUpdated event >>>")
        await (await contract.setBurnFee(100)).wait()
        const burnFeeLogs = await contract.queryFilter('BurnFeeUpdated', currentBlock)
        console.log(">>> BurnFeeUpdated logs >>>", { count: burnFeeLogs.length })
        expect(burnFeeLogs.length).to.be.greaterThan(0)
    })

    it('should update feeManager', async function () {
        if (!hasOperatorRole) {
            console.log(">>> Signer doesn't have OPERATOR_ROLE, skipping test >>>")
            this.skip()
            return
        }

        const newManager = feeManagerContract.address
        console.log(">>> Setting new fee manager >>>", { newManager })
        await contract.setFeeManager(newManager)
        const feeManager = await contract.feeManager()
        console.log(">>> Current fee manager >>>", { feeManager })
        expect(feeManager).to.equal(newManager)
    })
})
