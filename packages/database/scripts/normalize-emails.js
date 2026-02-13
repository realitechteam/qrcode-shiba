const { PrismaClient } = require('@prisma/client');

// Use the production URL if available, otherwise local
const prisma = new PrismaClient();

async function main() {
    console.log('Starting email normalization...');

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    const stats = {
        processed: 0,
        updated: 0,
        skipped: 0,
        duplicates: 0,
        errors: 0
    };

    // Create a map to track emails we've seen in this run (normalized)
    // maps lowercase_email -> userId
    const seenEmails = new Map();

    // First pass: Limit scope to what's in DB to build the map of "to-be" state
    // But since we are modifying DB, we should do it iteratively.

    // Strategy:
    // 1. Fetch all users.
    // 2. Iterate.
    // 3. Lowercase email.
    // 4. Check if we already processed this lowercase email in this batch OR if it exists in DB (excluding self).
    // 5. If duplicate, rename.
    // 6. If simple case change, update.

    for (const user of users) {
        stats.processed++;
        const originalEmail = user.email;
        const lowerEmail = originalEmail.toLowerCase();

        // If completely identical (already lowercase)
        if (originalEmail === lowerEmail) {
            // Check if we've seen this lowercase email before in this loop (meaning a previous iteration claimed it)
            if (seenEmails.has(lowerEmail)) {
                // This is a duplicate! (e.g. user processed earlier was 'user@test.com', this one is also 'user@test.com' - duplicate in DB?)
                // Or maybe detailed validation logic needed.
                console.log(`[DUPLICATE-EXISTING] User ${user.id} (${originalEmail}) duplicates another user.`);
                await handleDuplicate(user, lowerEmail);
                stats.duplicates++;
            } else {
                seenEmails.set(lowerEmail, user.id);
                stats.skipped++;
            }
            continue;
        }

        // It has uppercase characters.
        // Check if the lowercase version is already "taken" by another user in this batch
        if (seenEmails.has(lowerEmail)) {
            console.log(`[DUPLICATE-CASE] User ${user.id} (${originalEmail}) conflicts with processed ${lowerEmail}`);
            await handleDuplicate(user, lowerEmail);
            stats.duplicates++;
            continue;
        }

        // Check if lowercase version exists in DB (and it's not THIS user)
        // We already fetched all users, so we can check the `users` array, but easier to just check DB or our `seenEmails` map 
        // if we process carefully.
        // Let's rely on Prisma to catch unique constraint violation if we missed it, 
        // or doing a proactive check.

        const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
        if (existing && existing.id !== user.id) {
            console.log(`[DUPLICATE-DB] User ${user.id} (${originalEmail}) conflicts with existing DB user ${existing.id} (${existing.email})`);
            await handleDuplicate(user, lowerEmail);
            stats.duplicates++;
            // Record that we have seen this email (owned by the other guy)
            seenEmails.set(lowerEmail, existing.id);
            continue;
        }

        // Safe to update
        try {
            await prisma.user.update({
                where: { id: user.id },
                data: { email: lowerEmail }
            });
            console.log(`[UPDATED] ${originalEmail} -> ${lowerEmail}`);
            seenEmails.set(lowerEmail, user.id);
            stats.updated++;
        } catch (e) {
            console.error(`[ERROR] Failed to update ${originalEmail}: ${e.message}`);
            stats.errors++;
        }
    }

    console.log('Normalization complete.');
    console.log(stats);
}

async function handleDuplicate(user, lowerEmail) {
    // Rename to email+duplicate_{timestamp}@...
    // Actually usually email parts: user + _duplicate_timestamp + @domain
    const cleanEmail = lowerEmail.replace(/[^a-zA-Z0-9@._-]/g, '');
    const [local, domain] = cleanEmail.split('@');
    const newEmail = `${local}+dup${Date.now()}@${domain}`;

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { email: newEmail }
        });
        console.log(`[RESOLVED] Renamed duplicate ${user.email} to ${newEmail}`);
    } catch (e) {
        console.error(`[ERROR] Failed to rename duplicate ${user.email}: ${e.message}`);
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
