
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting email normalization...');

    // 1. Fetch all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        const lowerEmail = user.email.toLowerCase();

        // Only update if email is not already lowercase
        if (user.email !== lowerEmail) {
            console.log(`Normalizing email for user ${user.id}: ${user.email} -> ${lowerEmail}`);

            try {
                // Check if a user with the lowercase email already exists (collision)
                const existingUser = await prisma.user.findUnique({
                    where: { email: lowerEmail },
                });

                if (existingUser && existingUser.id !== user.id) {
                    console.warn(`⚠️ COLLISION DETECTED: User ${user.id} (${user.email}) conflicts with existing user ${existingUser.id} (${lowerEmail}). Skipping.`);
                    // TODO: specific handling for collisions if needed, e.g., appending a suffix
                    continue;
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: { email: lowerEmail },
                });
                console.log(`✅ Updated user ${user.id}`);
            } catch (error) {
                console.error(`❌ Failed to update user ${user.id}:`, error);
            }
        }
    }

    console.log('Email normalization complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
