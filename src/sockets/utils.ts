import { Answer, QuizQuestions } from '@prisma/client'

import prisma from '@lib/prisma'

export interface CurrentQuiz {
  id: number
  startTime: Date
  questions: QuizQuestions[]
}

interface SubmissionData {
  answers: {
    id: Answer['id'] | null
    time: number
  }[]
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
  userId,
  answers,
}: SubmissionData) {
  await prisma.quizSubmission.create({
    data: {
      quizId: quiz.id,
      userId,
      score: 0, // TODO: calculate actual score
      answers: {
        create: answers.map(({ id, time }, index) => ({
          questionId: quiz.questions[index].questionId,
          answerId: id,
          time,
          index,
        })),
      },
    },
  })
}
