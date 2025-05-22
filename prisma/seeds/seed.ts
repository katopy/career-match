import { PrismaClient } from "@prisma/client";
import { users } from "./users";
import { careers } from "./careers";
import { questions } from "./questions";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$transaction(async (tx) => {
            const allCareers = await tx.career.findMany();
            const allQuestions = await tx.question.findMany();

            for (const user of users) {
                const newUser = await tx.user.create({
                    data: {
                        name: user.name,
                        email: user.email,
                        password: user.password,
                    },
                });

                for (let i = 0; i < user.answers.create.length; i++) {
                    const question = allQuestions[i];
                    if (question) {
                        await tx.answer.create({
                            data: {
                                userId: newUser.id,
                                questionId: question.id,
                                choice: user.answers.create[i].answer,
                            },
                        });
                    }
                }

                for (const scoreEntry of user.scores.create) {
                    const career = allCareers.find(career => career.name === scoreEntry.career);
                    if (career) {
                        await tx.userCareer.create({
                            data: {
                                userId: newUser.id,
                                careerId: career.id,
                                score: scoreEntry.score,
                            },
                        });
                    }
                }
            }
        });

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