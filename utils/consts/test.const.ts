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
export const wallet1 = '0xfca1c3a52c77e89f0a2a8ac635afcaec3f76e5ee'
export const wallet2 = '0x8f4b22e6817984d376e8a1fa8f04edb705673c9e'
export const wallet3 = '0x1abe8c567f9c73c69150a4da20a89c2c1123224d'
export const wallet4 = '0x50a5c24f628d166ccdf48cb2df782ff1613f1b72'

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
