import { Answer, Question } from '@prisma/client'

import prisma from '@lib/prisma'

export interface CurrentQuiz {
  id: number
  startTime: Date
  questions: {
    question: Question & {
      answers: {
        id: number
      }[]
    }
  }[]
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
    orderBy: {
      startTime: 'asc',
    },
  })

  return quiz
}

interface SubmissionAnswer {
  id: Answer['id'] | null
  time: number
}

interface SubmissionData {
  answers: SubmissionAnswer[]
  quiz: CurrentQuiz
  userId: number
}

export async function createSubmission({
  quiz,
  userId,
  answers,
}: SubmissionData) {
  console.log(
    `Received submission from user ${userId} for quiz ${quiz.id}: `,
    answers,
  )

  // Check if number of given answers is the same as the number of questions of the quiz
  if (answers.length !== quiz.questions.length) {
    console.error(
      `Error: Invalid submission from user ${userId} for quiz ${quiz.id}: the number of answers must be equal to the number of questions of the quiz`,
    )
    return
  }

  // Check the answer ids actually correspond to possible answers for each question
  for (let i = 0; i < quiz.questions.length; i++) {
    const question = quiz.questions[i].question
    const answersIds = question.answers.map((a) => a.id)
    const givenAnswer = answers[i]

    // Check if answer was given
    if (!givenAnswer?.id) continue

    if (!answersIds.includes(givenAnswer.id)) {
      console.error(
        `Error: Invalid submission from user ${userId} for quiz ${quiz.id}: answerId ${givenAnswer.id} is not a possible choice for questionId ${question.id}`,
      )
      return
    }
  }

  await prisma.quizSubmission.create({
    data: {
      quizId: quiz.id,
      userId,
      score: 0, // TODO: calculate actual score
      answers: {
        create: answers.map(({ id, time }, index) => ({
          questionId: quiz.questions[index].question.id,
          answerId: id,
          time,
          index,
        })),
      },
    },
  })
}
