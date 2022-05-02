import { Question, Answer } from '@prisma/client'

import prisma from '@lib/prisma'
import controllers, { ControllerConfig } from '@utils/controllers'
import validateQuiz from '@validation/quizzes'

type Questions = (Question & {
  answers: Answer[]
})[]

const config: ControllerConfig = {
  method: 'post',
  path: '/quizzes',
  isPublic: true, // TODO: make it callable only by admin
}

controllers.register(config, async (req, res) => {
  const { name, description, price, questions, startTime } = req.body

  const errors: any = {}

  const [isValidName, messageName] = validateQuiz.name(name)
  if (!isValidName) {
    errors.name = messageName
  }

  const [isValidPrice, messagePrice] = validateQuiz.price(price?.toString())
  if (!isValidPrice) {
    errors.price = messagePrice
  }

  const [isValidStartTime, messageStartTime] = validateQuiz.startTime(startTime)
  if (!isValidStartTime) {
    errors.startTime = messageStartTime
  }

  // TODO: validate questions

  if (Object.keys(errors).length !== 0) {
    return res.badRequest(errors)
  }

  const quiz = await prisma.quiz.create({
    data: {
      name,
      description,
      price,
      startTime,
      questions: {
        create: (questions as Questions).map((question, index) => ({
          index,
          question: {
            create: {
              text: question.text,
              answers: {
                create: question.answers.map((answer, index) => ({
                  index,
                  text: answer.text,
                  correct: answer.correct,
                })),
              },
            },
          },
        })),
      },
    },
  })

  return res.resolve(quiz)
})
