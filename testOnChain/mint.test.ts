import { expect } from 'chai'
import { ethers } from 'hardhat'
import { contract, contractFromSigner2, feeManagerContract, signer, signer2 } from '../utils/consts/test.const'

describe('Mint logic', () => {
    let minterRole: string
    let lpReceiver: string
    let treasuryReceiver: string

    before(async () => {
        minterRole = await contract.MINTER_ROLE()
        lpReceiver = await feeManagerContract.lpReceiver()
        treasuryReceiver = await feeManagerContract.treasuryReceiver()

        // const setFeeManager = await contract.setFeeManager(feeManagerContract.address)
        // await setFeeManager.wait()
        console.log('>>> Set fee manager >>>', feeManagerContract.address)

        // const setReceivers = await feeManagerContract.updateReceivers(wallet3, wallet3)
        // await setReceivers.wait()

        // const lpReceiverAfter = await feeManagerContract.lpReceiver()
        // const treasuryReceiverAfter = await feeManagerContract.treasuryReceiver()

        // lpReceiver = lpReceiverAfter
        // treasuryReceiver = treasuryReceiverAfter

        // console.log('>>> Set lpReceiver >>>', lpReceiverAfter)
        // console.log('>>> Set treasuryReceiver >>>', treasuryReceiverAfter)
    })

    it('should mint tokens correctly', async () => {
        const mintAmount = ethers.utils.parseUnits('100000', 18)
        console.log('>>> Mint amount >>>', mintAmount.toString())

        const balanceBeforeMint = await contract.balanceOf(signer.address)
        console.log('>>> Balance before mint >>>', balanceBeforeMint.toString())

        const tx = await contract.mint(signer.address, mintAmount)
        await tx.wait()

        const balanceAfter = await contract.balanceOf(signer.address)
        console.log('>>> Balance after mint >>>', balanceAfter.toString())

        const netMinted = balanceAfter.sub(balanceBeforeMint)
        console.log('>>> Net minted >>>', netMinted.toString())
        expect(netMinted).to.equal(mintAmount)
    })

    it('should have mint logs', async () => {
        const mintAmount = ethers.utils.parseUnits('1000', 18)
        const tx = await contract.mint(signer.address, mintAmount)
        const receipt = await tx.wait()

        console.log('>>> Mint transaction hash >>>', tx.hash)
        console.log('>>> Mint block number >>>', receipt.blockNumber)

        const mintLogs = await contract.queryFilter('ReserveMinted', receipt.blockNumber, receipt.blockNumber)
        console.log('>>> Found mint logs >>>', mintLogs.length)
        mintLogs.forEach((log, index) => {
            console.log(`>>> Log ${index} >>>`, log.args)
        })

        expect(mintLogs.length).to.be.greaterThan(0)
    })

    it('should fail to mint without MINTER_ROLE', async () => {
        const recipient = signer2.address
        const isMinter = await contract.hasRole(minterRole, recipient)
        console.log('>>> Is signer2 minter? >>>', isMinter)

        await expect(contractFromSigner2.mint(recipient, 100)).to.be.reverted
    })

    it('should fail to mint to blocked recipient', async () => {
        await contract.addToBlacklist(signer2.address)
        try {
            await contract.mint(signer2.address, 100)
            expect.fail('Should have reverted')
        } catch (error: any) {
            console.log('>>> Mint to blocked error >>>', error.message)
            expect(error.message).to.include('revert')
        }
        await contract.removeFromBlacklist(signer2.address)
    })

    it('should fail to transfer from reserve to blocked recipient', async () => {
        await contract.addToBlacklist(signer2.address)
        try {
            await contract.transferFromReserve(signer2.address, 100)
            expect.fail('Should have reverted')
        } catch (error: any) {
            console.log('>>> Transfer from reserve to blocked error >>>', error.message)
            expect(error.message).to.include('revert')
        }
        await contract.removeFromBlacklist(signer2.address)
    })

    it('should transfer from reserve and apply mint fee', async () => {
        // await contract.setMintFee(100) // 1%
        // console.log('>>> Set mint fee to 1% >>>')

        const mintFee = await contract.mintFee()
        console.log('>>> Mint fee >>>', mintFee)

        // const isSigner2Blacklisted = await contract.isBlacklisted(signer2.address)
        // const isSigner2Frozen = await contract.isFrozen(signer2.address)
        // console.log('>>> Signer2 blacklisted >>>', isSigner2Blacklisted)
        // console.log('>>> Signer2 frozen >>>', isSigner2Frozen)

        // if (isSigner2Blacklisted) {
        //     const tx = await contract.removeFromBlacklist(signer2.address)
        //     await tx.wait()
        //     console.log('>>> Removed signer2 from blacklist >>>')
        // }
        // if (isSigner2Frozen) {
        //     const tx = await contract.unfreezeAccount(signer2.address)
        //     await tx.wait()
        //     console.log('>>> Unfroze signer2 >>>')
        // }

        const signerBalanceBefore = await contract.balanceOf(signer.address)
        console.log('>>> Signer balance before >>>', ethers.utils.formatEther(signerBalanceBefore))

        const recipient = signer2.address
        const recipientBalanceBefore = await contract.balanceOf(recipient)
        console.log('>>> Recipient balance before >>>', ethers.utils.formatEther(recipientBalanceBefore))

        // const lpBalanceBefore = await contract.balanceOf(lpReceiver)
        // const treasuryBalanceBefore = await contract.balanceOf(treasuryReceiver)
        // console.log('>>> LP receiver >>>', lpReceiver)
        // console.log('>>> Treasury receiver >>>', treasuryReceiver)
        // console.log('>>> LP balance before >>>', ethers.utils.formatEther(lpBalanceBefore))
        // console.log('>>> Treasury balance before >>>', ethers.utils.formatEther(treasuryBalanceBefore))

        const transferAmount = 200

        const currentMintFee = await contract.mintFee()
        console.log('>>> Current mint fee >>>', currentMintFee)
        const expectedFee = Math.floor((transferAmount * Number(currentMintFee)) / 10000)
        console.log('>>> Expected fee >>>', expectedFee)

        if (signerBalanceBefore.lt(transferAmount)) {
            console.log('>>> Signer balance insufficient, minting tokens >>>')
            const mintAmount = ethers.utils.parseUnits('1000000', 18)
            const mintTx = await contract.mint(signer.address, mintAmount)
            await mintTx.wait()
            console.log('>>> Minted tokens to signer >>>')
        }

        try {
            const tx = await contract.transferFromReserve(recipient, transferAmount)
            await tx.wait()

            const signerBalanceAfter = await contract.balanceOf(signer.address)
            console.log('>>> Signer balance after >>>', ethers.utils.formatEther(signerBalanceAfter))

            const recipientBalanceAfter = await contract.balanceOf(recipient)
            const netReceived = recipientBalanceAfter.sub(recipientBalanceBefore)

            expect(netReceived).to.equal(transferAmount - expectedFee)

            const lpBalanceAfter = await contract.balanceOf(lpReceiver)
            const treasuryBalanceAfter = await contract.balanceOf(treasuryReceiver)
            console.log('>>> LP balance after >>>', lpBalanceAfter.toString())
            console.log('>>> Treasury balance after >>>', treasuryBalanceAfter.toString())
        } catch (error: any) {
            console.log('>>> Error data >>>', error.error?.data)
            if (error.error?.data) {
                const decodedError = ethers.utils.toUtf8String('0x' + error.error.data.slice(10))
                console.log('>>> Decoded error >>>', decodedError)
            }
            throw error
        }
    })
})
