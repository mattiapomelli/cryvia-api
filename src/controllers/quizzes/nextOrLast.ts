import prisma from '@lib/prisma'
import { Quiz } from '@prisma/client'
import controllers, { AuthType, ControllerConfig } from '@utils/controllers'

const config: ControllerConfig = {
  method: 'get',
  path: '/quizzes/next-or-last',
  auth: AuthType.PUBLIC,
}

controllers.register(config, async (req, res) => {
  // Get next quiz
  let nextOrLastQuiz: Quiz | null = null

  const nextQuiz = await prisma.quiz.findFirst({
    where: {
      startTime: {
        gt: new Date(),
      },
    },
    include: {
      categories: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  if (nextQuiz) {
    nextOrLastQuiz = nextQuiz
  } else {
    // If there is no next quiz, then get last quiz
    const lastQuiz = await prisma.quiz.findFirst({
      include: {
        categories: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    })

    if (lastQuiz) {
      nextOrLastQuiz = lastQuiz
    }
  }

  res.resolve(nextOrLastQuiz)
})
