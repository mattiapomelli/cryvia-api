import { Answer } from '@prisma/client'

import prisma from '@lib/prisma'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

type Answers = Answer['id'][]

const config: ControllerConfig = {
  method: 'post',
  path: '/submissions',
  auth: AuthType.ADMIN,
}

controllers.register(config, async (req, res) => {
  const { quizId, userId, answers, time } = req.body

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

  // Check if number of given answers is the same as the number of questions of the quiz
  if (answers.length !== quiz.questions.length) {
    return res.badRequest(
      `The number of answers must be equal to the number of questions of quiz ${quizId}`,
    )
  }

  // Check the answer ids actually correspond to possible answers for each question
  for (let i = 0; i < quiz.questions.length; i++) {
    const answersIds = quiz.questions[i].question.answers.map((a) => a.id)

    if (!answers[i]) continue

    if (!answersIds.includes(answers[i])) {
      return res.badRequest(
        `AnswerId ${answers[i]} is not a possible choice for questionId ${quiz.questions[i].question.id}`,
      )
    }
  }

  const submission = await prisma.quizSubmission.create({
    data: {
      quizId,
      userId,
      time,
      answers: {
        create: (answers as Answers).map((answerId, index) => ({
          questionId: quiz.questions[index].question.id,
          answerId: answerId,
          index,
        })),
      },
    },
    select: {
      id: true,
      quizId: true,
      userId: true,
      submittedAt: true,
      answers: {
        orderBy: {
          index: 'asc',
        },
        select: {
          questionId: true,
          answerId: true,
        },
      },
    },
  })

  return res.resolve(submission)
})
