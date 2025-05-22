import { PrismaClient } from "@prisma/client";
import { users } from "./users";
import { careers } from "./careers";
import { questions } from "./questions";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.answer.deleteMany();
        await prisma.userCareer.deleteMany();
        await prisma.user.deleteMany();
        await prisma.question.deleteMany();
        await prisma.career.deleteMany();

        // Create careers and questions
        await prisma.career.createMany({ data: careers });
        await prisma.question.createMany({ data: questions });

        const allCareers = await prisma.career.findMany();
        const allQuestions = await prisma.question.findMany();

        for (const user of users) {
            await prisma.$transaction(async (tx) => {
                // Use upsert to handle both new and existing users
                const newUser = await tx.user.upsert({
                    where: { email: user.email },
                    update: {
                        name: user.name,
                        password: user.password,
                    },
                    create: {
                        name: user.name,
                        email: user.email,
                        password: user.password,
                    },
                });

                // Rest of your code remains the same...
                for (let i = 0; i < user.answers.create.length; i++) {
                    const question = allQuestions[i];
                    if (question) {
                        await tx.answer.upsert({
                            where: {
                                userId_questionId: {
                                    userId: newUser.id,
                                    questionId: question.id,
                                },
                            },
                            update: {
                                choice: user.answers.create[i].answer,
                            },
                            create: {
                                userId: newUser.id,
                                questionId: question.id,
                                choice: user.answers.create[i].answer,
                            },
                        });
                    }
                }

                for (const scoreEntry of user.scores.create) {
                    const career = allCareers.find(c => c.name === scoreEntry.career);
                    if (career) {
                        await tx.userCareer.upsert({
                            where: {
                                userId_careerId: {
                                    userId: newUser.id,
                                    careerId: career.id,
                                },
                            },
                            update: {
                                score: scoreEntry.score,
                            },
                            create: {
                                userId: newUser.id,
                                careerId: career.id,
                                score: scoreEntry.score,
                            },
                        });
                    }
                }
            });
        }

        console.log('Seeding completed successfully.');

    } catch (error) {
        console.error(error);
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                console.error('Email already exists');
            }
        }
        process.exit(1);
    }

}

main();


main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());