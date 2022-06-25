import { ethers, Signer } from 'ethers'

import { QUIZ_CONTRACT_ADDRESS, TOKEN_ADDRESS } from 'constants/addresses'
import QuizContractAbi from '@abis/contracts/Quiz.json'
import ERC20Abi from '@abis/contracts/ERC20.json'
import { Quiz, ERC20 } from '@abis/types'

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL)

if (!process.env.OWNER_PRIVATE_KEY) {
  throw Error('Environment variable OWNER_PRIVATE_KEY must be defined')
}

export const getSigner = (privateKey: string) =>
  new ethers.Wallet(privateKey, provider)

const owner = getSigner(process.env.OWNER_PRIVATE_KEY)

export async function getQuizContract(signer?: Signer) {
  return new ethers.Contract(
    QUIZ_CONTRACT_ADDRESS,
    QuizContractAbi.abi,
    signer || owner,
  ) as Quiz
}

export async function getTokenContract(signer?: Signer) {
  return new ethers.Contract(
    TOKEN_ADDRESS,
    ERC20Abi.abi,
    signer || owner,
  ) as ERC20
}
