import { expect } from 'chai'
import { signer, contract, signer2, wallet3 } from '../utils/consts/test.const'

describe('Blocked accounts (freeze and blacklist) logic', () => {
    before(async () => {
        if (!contract) {
            throw new Error('KRWIN contract not available')
        }

        const freezerRole = await contract.FREEZER_ROLE()
        const blacklisterRole = await contract.BLACKLISTER_ROLE()

        if (!(await contract.hasRole(freezerRole, signer.address))) {
            await contract.connect(signer).grantRole(freezerRole, signer.address)
        }
        if (!(await contract.hasRole(blacklisterRole, signer.address))) {
            await contract.connect(signer).grantRole(blacklisterRole, signer.address)
        }

        if (await contract.isFrozen(wallet3)) {
            const unfreezeTx = await contract.connect(signer).unfreezeAccount(wallet3)
            await unfreezeTx.wait()
        }
        if (await contract.isBlacklisted(wallet3)) {
            const unblacklistTx = await contract.connect(signer).removeFromBlacklist(wallet3)
            await unblacklistTx.wait()
        }
    })

    after(async () => {
        if (contract) {
            if (await contract.isFrozen(wallet3)) {
                const unfreezeTx = await contract.connect(signer).unfreezeAccount(wallet3)
                await unfreezeTx.wait()
            }
            if (await contract.isBlacklisted(wallet3)) {
                const unblacklistTx = await contract.connect(signer).removeFromBlacklist(wallet3)
                await unblacklistTx.wait()
            }
        }
    })

    it('should allow FREEZER_ROLE to freeze and unfreeze wallet3', async () => {
        const freezeTx = await contract.connect(signer).freezeAccount(wallet3)
        await freezeTx.wait()

        const frozen = await contract.isFrozen(wallet3)
        console.log('>>> Is wallet3 frozen? >>>', frozen)
        expect(frozen).to.equal(true)

        const unfreezeTx = await contract.connect(signer).unfreezeAccount(wallet3)
        await unfreezeTx.wait()

        const unfrozen = await contract.isFrozen(wallet3)
        console.log('>>> Is wallet3 unfrozen? >>>', unfrozen)
        expect(unfrozen).to.equal(false)
    })

    it('should allow BLACKLISTER_ROLE to blacklist and unblacklist wallet3', async () => {
        const blacklistTx = await contract.connect(signer).addToBlacklist(wallet3)
        await blacklistTx.wait()

        const blacklisted = await contract.isBlacklisted(wallet3)
        console.log('>>> Is wallet3 blacklisted? >>>', blacklisted)
        expect(blacklisted).to.equal(true)

        const unblacklistTx = await contract.connect(signer).removeFromBlacklist(wallet3)
        await unblacklistTx.wait()

        const unblacklisted = await contract.isBlacklisted(wallet3)
        console.log('>>> Is wallet3 unblacklisted? >>>', unblacklisted)
        expect(unblacklisted).to.equal(false)
    })


    it('should check isBlocked function correctly', async () => {
        let isBlocked = await contract.isBlocked(wallet3)
        console.log('>>> Initial isBlocked >>>', isBlocked)
        expect(isBlocked).to.equal(false)

        console.log('>>> Freezing wallet3... >>>')
        const freezeTx = await contract.connect(signer).freezeAccount(wallet3)  
        await freezeTx.wait()

        isBlocked = await contract.isBlocked(wallet3)
        console.log('>>> isBlocked after freeze >>>', isBlocked)
        expect(isBlocked).to.equal(true)

        console.log('>>> Unfreezing wallet3... >>>')
        const unfreezeTx = await contract.connect(signer).unfreezeAccount(wallet3)
        await unfreezeTx.wait()
        
        isBlocked = await contract.isBlocked(wallet3)
        console.log('>>> isBlocked after unfreeze >>>', isBlocked)
        expect(isBlocked).to.equal(false)

        console.log('>>> Blacklisting wallet3... >>>')
        const blacklistTx = await contract.connect(signer).addToBlacklist(wallet3)
        await blacklistTx.wait()
        
        isBlocked = await contract.isBlocked(wallet3)
        console.log('>>> isBlocked after blacklist >>>', isBlocked)
        expect(isBlocked).to.equal(true)

        console.log('>>> Unblacklisting wallet3... >>>')
        const unblacklistTx = await contract.connect(signer).removeFromBlacklist(wallet3)
        await unblacklistTx.wait()
        
        isBlocked = await contract.isBlocked(wallet3)
        console.log('>>> isBlocked after unblacklist >>>', isBlocked)
        expect(isBlocked).to.equal(false)
    }).timeout(120000) 
})
