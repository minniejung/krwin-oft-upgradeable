    import { expect } from 'chai'
    import { contract, contractFromSigner2, signer, signer2, wallet2, wallet3 } from '../utils/consts/test.const'

    describe('Transfer logic', () => {
        before(async () => {
            // try {
            //     const mintFirst = await contract.mint(signer.address, 1000)
            //     await mintFirst.wait()
            //     console.log('>>> Minted 1000 tokens to signer >>>')
            // } catch (error: any) {
            //     console.log('>>> Mint failed in before hook >>>', error.message)
            // }

            // if (await contract.isBlacklisted(signer2.address)) {
            //     const unblacklistTx = await contract.removeFromBlacklist(signer2.address)
            //     await unblacklistTx.wait()
            // }
            // if (await contract.isFrozen(signer2.address)) {
            //     const unfreezeTx = await contract.unfreezeAccount(signer2.address)
            //     await unfreezeTx.wait()
            // }
            // if (await contract.isBlacklisted(wallet3)) {
            //     const unblacklistTx = await contract.removeFromBlacklist(wallet3)
            //     await unblacklistTx.wait()
            // }
            // if (await contract.isFrozen(wallet3)) {
            //     const unfreezeTx = await contract.unfreezeAccount(wallet3)
            //     await unfreezeTx.wait()
            // }

            // const isBlockedSigner2=await contract.isBlocked(signer2.address)
            // console.log('>>> isBlockedSigner2 >>> ', isBlockedSigner2)
            // expect(isBlockedSigner2).to.equal(false)

            // const isBlockedSigner3=await contract.isBlocked(wallet3)
            // console.log('>>> isBlockedSigner3 >>> ', isBlockedSigner3)
            // expect(isBlockedSigner3).to.equal(false)

        })

        it('should transfer tokens when not blocked', async () => {
            const recipient = signer2.address

            const balanceBeforeSender = await contract.balanceOf(signer.address)
            const balanceBeforeRecipient = await contract.balanceOf(recipient)
            console.log('>>> balanceBeforeSender >>> ', balanceBeforeSender.toString())
            console.log('>>> balanceBeforeRecipient >>> ', balanceBeforeRecipient.toString())

            const tx = await contract.transfer(recipient, 100)
            await tx.wait()

            const balanceAfterSender = await contract.balanceOf(signer.address)
            const balanceAfterRecipient = await contract.balanceOf(recipient)
            console.log('>>> balanceAfterSender >>> ', balanceAfterSender.toString())
            console.log('>>> balanceAfterRecipient >>> ', balanceAfterRecipient.toString())

            expect(balanceAfterSender).to.equal(balanceBeforeSender.sub(BigInt(100)))
            expect(balanceAfterRecipient).to.equal(balanceBeforeRecipient.add(BigInt(100)))
        })

        it('should transferFrom tokens when not blocked', async () => {
            const approving = await contractFromSigner2.approve(signer.address, 200)
            await approving.wait()

            const allowance = await contract.allowance(signer2.address, signer.address)
            console.log('>>> allowance >>>', allowance.toString())

            const balanceBeforeFrom = await contract.balanceOf(signer2.address)
            const balanceBeforeTo = await contract.balanceOf(wallet3)
            console.log('>>> balanceBeforeFrom >>> ', balanceBeforeFrom.toString())
            console.log('>>> balanceBeforeTo >>> ', balanceBeforeTo.toString())

            const tx = await contract.transferFrom(signer2.address, wallet3, 150)
            await tx.wait()

            const balanceAfterFrom = await contract.balanceOf(signer2.address)
            const balanceAfterTo = await contract.balanceOf(wallet3)
            console.log('>>> balanceAfterFrom >>> ', balanceAfterFrom.toString())
            console.log('>>> balanceAfterTo >>> ', balanceAfterTo.toString())

            expect(balanceAfterFrom).to.equal(balanceBeforeFrom.sub(BigInt(150)))
            expect(balanceAfterTo).to.equal(balanceBeforeTo.add(BigInt(150)))
        })

        it('should revert transfer if sender is blocked', async () => {
            await contract.addToBlacklist(wallet2)
            await expect(contractFromSigner2.transfer(wallet3, 10)).to.be.reverted

            await contract.removeFromBlacklist(wallet2)
        })

        it('should revert transfer if recipient is blocked', async () => {
            await contract.addToBlacklist(wallet3)
            await expect(contract.transfer(wallet3, 10)).to.be.reverted

            await contract.removeFromBlacklist(wallet3)
        })

        it('should revert transferFrom if sender is blocked', async () => {
            if (await contract.isBlacklisted(signer2.address)) {
                await contract.connect(signer).removeFromBlacklist(signer2.address)
                console.log('>>> Unblacklisted signer2 >>>')
            }
            await contractFromSigner2.approve(signer.address, 50)            
            await contract.addToBlacklist(wallet2)
            await expect(contract.transferFrom(wallet2, wallet3, 10)).to.be.reverted

            await contract.removeFromBlacklist(wallet2)
        })

        it('should revert transferFrom if recipient is blocked', async () => {
            if (await contract.isBlacklisted(signer2.address)) {
                await contract.connect(signer).removeFromBlacklist(signer2.address)
                console.log('>>> Unblacklisted signer2 >>>')
            }
            
            await contract.addToBlacklist(wallet3)
            await contractFromSigner2.approve(signer.address, 50)
            await expect(contract.transferFrom(signer2.address, wallet3, 10)).to.be.reverted

            await contract.removeFromBlacklist(wallet3)
        })
    })
