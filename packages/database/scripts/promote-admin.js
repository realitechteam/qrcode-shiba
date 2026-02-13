
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'partner@realitech.dev';
    console.log(`Checking user: ${email}`);

    const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
        console.error(`User not found: ${email}`);
        process.exit(1);
    }

    console.log(`Found user: ${user.id}, Role: ${user.role}, Tier: ${user.tier}`);

    if (user.role !== 'ADMIN') {
        console.log(`Promoting user to ADMIN...`);
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' },
        });
        console.log(`✅ User promoted to ADMIN.`);
    } else {
        console.log(`✅ User is already ADMIN.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
