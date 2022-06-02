import { Answer, Question } from '@prisma/client'

import prisma from '@lib/prisma'

export interface CurrentQuiz {
  id: number
  startTime: Date
  questions: {
    question: Question & {
      answers: {
        id: number
        correct: boolean
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
                  correct: true,
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

const SECONDS_PER_QUESTION = 10

function calculateScore(quiz: CurrentQuiz, answers: SubmissionAnswer[]) {
  let score = 0

  for (const [index, question] of quiz.questions.entries()) {
    const answer = answers[index]

    // If no answer was given, continue
    if (!answer.id) continue

    const correctAnswer = question.question.answers.find((a) => a.correct)

    // Check if answer is correct
    if (answer.id === correctAnswer?.id) {
      score += 10

      // Calculate bonus factor based on the time taken to answer
      const bonusFactor = 1 - answer.time / (SECONDS_PER_QUESTION * 1000) // TODO: decide how to proper calculate this factor

      // For how we calculate time, the given submission time could be some millis greater than the max
      // time per questions. In order to avoid to subtract points, we multiply by the maximum between
      // the bonusFactor and 0
      score += Math.max(bonusFactor, 0) * 10
    }
  }

  const formattedScore = Number(score.toFixed(2)) * 100

  return formattedScore
}

export async function createSubmission({
  quiz,
  userId,
  answers,
}: SubmissionData) {
  // Check if number of given answers is the same as the number of questions of the quiz
  if (answers.length !== quiz.questions.length) {
    console.error(
      `Error: Received invalid submission from user ${userId} for quiz ${quiz.id}: the number of answers must be equal to the number of questions of the quiz`,
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
        `Error: Received invalid submission from user ${userId} for quiz ${quiz.id}: answerId ${givenAnswer.id} is not a possible choice for questionId ${question.id}`,
      )
      return
    }
  }

  const score = calculateScore(quiz, answers)

  console.log(
    `Received submission from user ${userId} for quiz ${quiz.id}. Score: ${score}. Answers: `,
    answers,
  )

  await prisma.quizSubmission.create({
    data: {
      quizId: quiz.id,
      userId,
      score,
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
