import { ethers } from 'ethers'

import { QUIZ_CONTRACT_ADDRESS } from 'constants/addresses'
import QuizContractAbi from '@abis/contracts/Quiz.json'
import { Quiz } from '@abis/types'

const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL)

if (!process.env.OWNER_PRIVATE_KEY) {
  throw Error('Environment variable OWNER_PRIVATE_KEY must be defined')
}

const signer = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider)

export async function getQuizContract() {
  return new ethers.Contract(
    QUIZ_CONTRACT_ADDRESS,
    QuizContractAbi.abi,
    signer,
  ) as Quiz
}
