import validator from 'validator'
import { isAddress } from '@ethersproject/address'

type Validation = {
  [key: string]: (value?: string) => [boolean, string]
}

const validateUser: Validation = {
  id: (id) => {
    if (!id) {
      return [false, 'Id is required']
    }

    if (!validator.isNumeric(id)) {
      return [false, 'Id must be numeric']
    }

    return [true, '']
  },
  address: (address) => {
    if (!address) {
      return [false, 'Address is required']
    }

    if (!isAddress(address)) {
      return [false, 'Address is not valid']
    }

    return [true, '']
  },
  username: (username) => {
    if (!username) {
      return [false, 'Username is required']
    }

    if (!validator.isLength(username, { min: 3, max: 24 })) {
      return [false, 'Username must be between 3 and 24 characters long']
    }

    return [true, '']
  },
}

export default validateUser
