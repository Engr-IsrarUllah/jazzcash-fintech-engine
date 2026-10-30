require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding initial data...');

    // 1. Telecoms Create Karein
    const jazz = await prisma.telecom.upsert({
        where: { code: 'JAZZ' },
        update: {},
        create: { name: 'Jazz', code: 'JAZZ' },
    });

    const zong = await prisma.telecom.upsert({
        where: { code: 'ZONG' },
        update: {},
        create: { name: 'Zong', code: 'ZONG' },
    });

    const telenor = await prisma.telecom.upsert({
        where: { code: 'TELENOR' },
        update: {},
        create: { name: 'Telenor', code: 'TELENOR' },
    });

    const ufone = await prisma.telecom.upsert({
        where: { code: 'UFONE' },
        update: {},
        create: { name: 'Ufone', code: 'UFONE' },
    });

    console.log('Telecoms created: Jazz, Zong, Telenor, Ufone');

    // 2. Promotions & Junction Table Rules Create Karein (Scenario 1)

    // Promo 1: SUNDAY5
    const sundayPromo = await prisma.promotion.upsert({
        where: { code: 'SUNDAY5' },
        update: {},
        create: {
            code: 'SUNDAY5',
            description: 'Sunday Special: 5% on Jazz, 10% on Zong',
            usageLimit: 5000,
        },
    });

    // SUNDAY5 Rules (Junction Table)
    await prisma.promotionTelecomRule.upsert({
        where: {
            promotionId_telecomId: { promotionId: sundayPromo.id, telecomId: jazz.id },
        },
        update: {},
        create: {
            promotionId: sundayPromo.id,
            telecomId: jazz.id,
            discountType: 'PERCENTAGE',
            discountValue: 5.0,
            maxCap: 50.0,
        },
    });

    await prisma.promotionTelecomRule.upsert({
        where: {
            promotionId_telecomId: { promotionId: sundayPromo.id, telecomId: zong.id },
        },
        update: {},
        create: {
            promotionId: sundayPromo.id,
            telecomId: zong.id,
            discountType: 'PERCENTAGE',
            discountValue: 10.0,
            maxCap: 100.0,
        },
    });

    // Promo 2: EID_BONUS (Telenor Exclusive - Scenario 1 & 5)
    const eidPromo = await prisma.promotion.upsert({
        where: { code: 'EID_BONUS' },
        update: {},
        create: {
            code: 'EID_BONUS',
            description: 'Eid Mega Bonus: 15% on Telenor only (Limit 1,000)',
            usageLimit: 1000,
            currentUsage: 999, // Humne 999 rakha hai taake hum Scenario 5 ka race condition test kar sakein!
        },
    });

    await prisma.promotionTelecomRule.upsert({
        where: {
            promotionId_telecomId: { promotionId: eidPromo.id, telecomId: telenor.id },
        },
        update: {},
        create: {
            promotionId: eidPromo.id,
            telecomId: telenor.id,
            discountType: 'PERCENTAGE',
            discountValue: 15.0,
            maxCap: 150.0,
        },
    });

    console.log('Promotions & Junction Rules seeded successfully');

    // 3. Test User & Wallet Create Karein (Rs. 5,000 Balance)
    const testUser = await prisma.user.upsert({
        where: { phone: '03001234567' },
        update: {},
        create: {
            name: 'Israr Ullah',
            phone: '03001234567',
            wallet: {
                create: {
                    balance: 5000.0,
                    currency: 'PKR',
                },
            },
        },
    });

    console.log(`Test User created: ${testUser.name} with Rs. 5,000 Wallet Balance`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
