import { expect } from 'chai'

import { contract, signer, signer2, wallet2 } from '../utils/consts/test.const'

describe('Access Control', () => {
    let adminRole: string
    let operatorRole: string
    let minterRole: string
    let fundRecoveryRole: string

    before(async () => {
        if (!contract) {
            throw new Error('KRWIN contract not available')
        }

        console.log('>>> Signer address >>> ', signer.address)
        console.log('>>> Contract address >>> ', contract.address)

        try {
            adminRole = await contract.DEFAULT_ADMIN_ROLE()
            minterRole = await contract.MINTER_ROLE()
            operatorRole = await contract.OPERATOR_ROLE()
            fundRecoveryRole = await contract.FUNDS_RECOVERY_ROLE()
        } catch (error) {
            console.error('Error getting roles:', error)
            throw error
        }
    })

    it('should confirm signer is DEFAULT_ADMIN_ROLE', async () => {
        const isAdmin = await contract.hasRole(adminRole, signer.address)
        console.log('>>> Signer is admin >>> ', isAdmin)
        expect(isAdmin).to.be.true
    })

    it('should return correct admin for OPERATOR_ROLE', async () => {
        const isOperator = await contract.hasRole(operatorRole, signer.address)
        console.log('>>> Signer has OPERATOR_ROLE >>> ', isOperator)
        expect(isOperator).to.be.true
    })

    it('should return correct admin for MINTER_ROLE', async () => {
        const isMinter = await contract.hasRole(minterRole, signer.address)
        console.log('>>> Signer has MINTER_ROLE >>> ', isMinter)
        expect(isMinter).to.be.true
    })

    it('should return correct admin for FUNDS_RECOVERY_ROLE', async () => {
        const isFundsRecovery = await contract.hasRole(fundRecoveryRole, signer.address)
        console.log('>>> Signer has FUNDS_RECOVERY_ROLE >>> ', isFundsRecovery)
        expect(isFundsRecovery).to.be.true
    })

    it('should grant and revoke OPERATOR_ROLE to wallet2', async () => {
        const grantTx = await contract.grantRole(operatorRole, wallet2)
        await grantTx.wait()
        const isOperator = await contract.hasRole(operatorRole, wallet2)
        console.log('>>> W2 has OPERATOR_ROLE >>> ', isOperator)
        expect(isOperator).to.be.true

        const revokeTx = await contract.revokeRole(operatorRole, wallet2)
        await revokeTx.wait()
        const isNotOperator = await contract.hasRole(operatorRole, wallet2)
        console.log(">>> W2 doesn't have OPERATOR_ROLE >>> ", isNotOperator)
        expect(isNotOperator).to.be.false
    })

    it('should revert if unauthorized account tries to grant role', async () => {
        if (!signer2) {
            console.log('>>> Skipping test: signer2 not available >>>')
            return
        }

        console.log('>>> Signer2 address >>>', signer2.address)

        const hasAdmin = await contract.hasRole(adminRole, signer2.address)
        console.log('>>> Signer2 is admin >>>', hasAdmin)

        try {
            await contract.connect(signer2).grantRole(operatorRole, wallet2)
            expect.fail('Transaction should have reverted')
        } catch (error: any) {
            const errorData = error.error?.data || error.data
            console.log('>>> raw revert data >>>', errorData)
        }
    })
})
