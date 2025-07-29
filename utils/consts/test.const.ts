import hre from 'hardhat'
import { ethers } from 'ethers'
import * as dotenv from 'dotenv'
import { getNetworkInfo } from '../helpers/ethers.helper'
import { address as contractAddress, abi as contractAbi } from '../../deployments/sepolia-testnet/KRWIN.json'
import {
    address as feeManagerContractAddress,
    abi as feeManagerAbi,
} from '../../deployments/sepolia-testnet/FeeManager.json'

dotenv.config()

const network = hre.network.name
const isTestnet = network.includes('testnet')

const RPC_URL =
    process.env[`RPC_URL_${network.toUpperCase().replace('-', '_')}`] ||
    process.env.RPC_URL_SEPOLIA_TESTNET ||
    'https://rpc.sepolia.org'

export const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL_KAIA)

export const signer = new ethers.Wallet(process.env.PRIVATE_KEY_METAMASK as string, provider)
export const contract = new ethers.Contract(contractAddress, contractAbi, signer)

export const signer2 = new ethers.Wallet(process.env.PRIVATE_KEY_METAMASK_2 as string, provider)
export const contractFromSigner2 = contract.connect(signer2)

export const feeManagerContract = new ethers.Contract(feeManagerContractAddress, feeManagerAbi, signer)

// Test wallet addresses
export const wallet1 = process.env.METAMASK_WALLET_ADDRESS_1
export const wallet2 = process.env.METAMASK_WALLET_ADDRESS_2
export const wallet3 = process.env.METAMASK_WALLET_ADDRESS_3
export const wallet4 = process.env.METAMASK_WALLET_ADDRESS_4

export const networkInfo = getNetworkInfo(network, RPC_URL, hre.network.config.chainId)

// Contract information
export const contractInfo = {
    krwin: {
        address: contractAddress,
        abi: contractAbi,
        contract,
    },
    feeManager: {
        address: feeManagerContractAddress,
        abi: feeManagerAbi,
        contract: feeManagerContract,
    },
}
