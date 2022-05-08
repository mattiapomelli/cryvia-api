import { QuizQuestions } from '@prisma/client'

import prisma from '@lib/prisma'

export interface CurrentQuiz {
  id: number
  startTime: Date
  questions: QuizQuestions[]
}

interface SubmissionData {
  answers: number[]
  time: number
  quiz: CurrentQuiz
  userId: number
}

export async function getNextQuiz() {
  const quiz = await prisma.quiz.findFirst({
    where: {
      startTime: {
        gte: new Date(),
      },
    },
    select: {
      id: true,
      startTime: true,
      questions: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  return quiz
}

export async function createSubmission({
  quiz,
  answers,
  time,
  userId,
}: SubmissionData) {
  await prisma.quizSubmission.create({
    data: {
      quizId: quiz.id,
      userId,
      time,
      answers: {
        create: answers.map((answerId, index) => ({
          questionId: quiz.questions[index].questionId,
          answerId: answerId,
          index,
        })),
      },
    },
  })
}
