
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'Huynhhieu0608@gmail.com';
    console.log(`Checking user: ${email}`);

    const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
        console.error(`User not found: ${email}`);
        process.exit(1);
    }

    console.log(`User: ${user.id}`);
    console.log(`Role: ${user.role}`);
    console.log(`BannedAt: ${user.bannedAt}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
