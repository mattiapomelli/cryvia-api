import validator from 'validator'

import { Validation } from 'types'

const quizValidators: Validation = {
  id: (id) => {
    if (!id) {
      return [false, 'Id is required']
    }

    if (!validator.isNumeric(id)) {
      return [false, 'Id must be numeric']
    }

    return [true, '']
  },
  title: (title) => {
    if (!title) {
      return [false, 'Title is required']
    }

    if (!(typeof title === 'string')) {
      return [false, 'Quiz title must be a string']
    }

    if (!validator.isLength(title, { min: 3, max: 100 })) {
      return [false, 'Quiz title must be between 3 and 100 characters long']
    }

    return [true, '']
  },
  price: (price) => {
    if (!price) {
      return [false, 'Price is required']
    }

    if (!validator.isInt(price)) {
      return [false, 'Price must be an integer']
    }

    return [true, '']
  },
  startTime: (startTime) => {
    if (!startTime) {
      return [false, 'Start time is required']
    }

    if (new Date(startTime).toString() === 'Invalid Date') {
      return [false, 'Start time must be a date']
    }

    if (!(new Date(startTime) > new Date())) {
      return [false, 'Start time must not be already passed']
    }

    return [true, '']
  },
}

interface QuizValidator {
  [key: keyof typeof quizValidators]: any
}

const validateQuiz = (
  quiz: QuizValidator,
): [boolean, Record<string, string>] => {
  const errors: Record<string, string> = {}

  Object.keys(quiz).forEach((value) => {
    const validator = quizValidators[value.toString()](quiz[value.toString()])
    if (!validator[0]) {
      errors[value.toString()] = validator[1]
    }
  })

  if (Object.keys(errors).length) return [false, errors]

  return [true, {}]
}

export { quizValidators }

export default validateQuiz
