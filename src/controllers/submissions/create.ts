import { Answer } from '@prisma/client'

import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

type Answers = {
  id: Answer['id'] | null
  time: number
}[]

const config: ControllerConfig = {
  method: 'post',
  path: '/submissions',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { quizId, userId, answers } = req.body

  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      questions: {
        orderBy: {
          index: 'asc',
        },
        select: {
          index: false,
          question: {
            include: {
              answers: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  })

  // Check if quiz ecists
  if (!quiz) {
    return res.notFound('Quiz not found')
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    return res.notFound('User not found')
  }

  // TODO: check if user has already submitted the quiz

  // Check if number of given answers is the same as the number of questions of the quiz
  if (answers.length !== quiz.questions.length) {
    return res.badRequest(
      `The number of answers must be equal to the number of questions of quiz ${quizId}`,
    )
  }

  // Check the answer ids actually correspond to possible answers for each question
  for (let i = 0; i < quiz.questions.length; i++) {
    const answersIds = quiz.questions[i].question.answers.map((a) => a.id)
    const givenAnswer = (answers as Answers)[i]

    // Check if answer was given
    if (!givenAnswer?.id) continue

    if (!answersIds.includes(givenAnswer.id)) {
      return res.badRequest(
        `AnswerId ${givenAnswer.id} is not a possible choice for questionId ${quiz.questions[i].question.id}`,
      )
    }
  }

  const submission = await prisma.quizSubmission.create({
    data: {
      quizId,
      userId,
      score: 0, // TODO: calculate actual score
      answers: {
        create: (answers as Answers).map(({ id, time }, index) => ({
          questionId: quiz.questions[index].question.id,
          answerId: id,
          time,
          index,
        })),
      },
    },
    select: {
      id: true,
      quizId: true,
      userId: true,
      submittedAt: true,
      score: true,
      answers: {
        orderBy: {
          index: 'asc',
        },
        select: {
          questionId: true,
          answerId: true,
          time: true,
        },
      },
    },
  })

  return res.resolve(submission)
})
