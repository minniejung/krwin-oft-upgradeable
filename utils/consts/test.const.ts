import * as dotenv from 'dotenv'
import { ethers } from 'ethers'
import hre from 'hardhat'

dotenv.config()

const network = hre.network.name
const isTestnet = network.includes('testnet')

const getDeploymentPath = (networkName: string) => {
    if (networkName.includes('mainnet')) {
        return 'mainnet'
    } else if (networkName.includes('sepolia')) {
        return 'sepolia-testnet'
    }
    return 'sepolia-testnet'
}

const deploymentPath = getDeploymentPath(network)
const krwinDeployment = require(`../../deployments/${deploymentPath}/KRWIN.json`)
const feeManagerDeployment = require(`../../deployments/${deploymentPath}/FeeManager.json`)

const { abi: contractAbi, address: contractAddress } = krwinDeployment
const { abi: feeManagerAbi, address: feeManagerContractAddress } = feeManagerDeployment

const RPC_URL =
    process.env[`RPC_URL_${network.toUpperCase().replace('-', '_')}`] ||
    process.env.RPC_URL_SEPOLIA_TESTNET ||
    'https://rpc.sepolia.org'

export const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

export const signer = new ethers.Wallet(process.env.PRIVATE_KEY_METAMASK_1 as string, provider)
export const contract = new ethers.Contract(contractAddress, contractAbi, signer)

export const signer2 = new ethers.Wallet(process.env.PRIVATE_KEY_METAMASK_2 as string, provider)
export const contractFromSigner2 = contract.connect(signer2)

export const feeManagerContract = new ethers.Contract(feeManagerContractAddress, feeManagerAbi, signer)

// Test wallet addresses
export const wallet1 = process.env.METAMASK_WALLET_ADDRESS_1!
export const wallet2 = process.env.METAMASK_WALLET_ADDRESS_2!
export const wallet3 = process.env.METAMASK_WALLET_ADDRESS_3!
export const wallet4 = process.env.METAMASK_WALLET_ADDRESS_4!
