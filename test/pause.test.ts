import { expect } from 'chai'
import { signer, contract} from '../utils/consts/test.const'

describe('Pause logic', () => {
    before(async () => {
        if (!contract) {
            throw new Error('KRWIN contract not available')
        }

        const operatorRole = await contract.OPERATOR_ROLE()
        if (!(await contract.hasRole(operatorRole, signer.address))) {
            console.log('>>> Granting OPERATOR_ROLE to signer >>>')
            await contract.connect(signer).grantRole(operatorRole, signer.address)
        }

        if (await contract.isPaused()) {
            console.log('>>> Unpausing contract before test >>>')
            await contract.connect(signer).unpause()
        }
    })

    after(async () => {        
        if (contract && await contract.isPaused()) {
            await contract.connect(signer).unpause()
        }
    })

    it('should allow OPERATOR_ROLE to pause and unpause the contract', async () => {        
        const pauseTx = await contract.pause()
        await pauseTx.wait()
        console.log('>>> Contract paused >>>')

        const paused = await contract.isPaused()
        console.log('>>> Is contract paused? >>>', paused)
        expect(paused).to.equal(true)

        const unpauseTx = await contract.unpause()
        await unpauseTx.wait()
        console.log('>>> Contract unpaused >>>')

        const unpaused = await contract.isPaused()
        console.log('>>> Is contract unpaused? >>>', unpaused)
        expect(unpaused).to.equal(false)
    })
})
