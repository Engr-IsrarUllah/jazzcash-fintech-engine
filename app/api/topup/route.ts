import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // 1. Idempotency Key Header se check karein (Duplicate Payment rokne ke liye)
        const idempotencyKey = req.headers.get('idempotency-key');
        if (!idempotencyKey) {
            return NextResponse.json(
                { error: 'Idempotency-Key header is required for payment safety' },
                { status: 400 }
            );
        }

        // Check karein kya yeh key pehle use ho chuki hai?
        const existingTransaction = await prisma.transaction.findUnique({
            where: { idempotencyKey },
        });

        if (existingTransaction) {
            return NextResponse.json({
                message: 'Transaction already processed (Idempotent response)',
                transaction: existingTransaction,
            });
        }

        // 2. Request Data Read karein
        const body = await req.json();
        const { phoneNumber, amount, telecomCode, promoCode } = body;

        // 3. Validation: Pakistani Phone Format (Regex)
        const pakPhoneRegex = /^03\d{9}$/;
        if (!phoneNumber || !pakPhoneRegex.test(phoneNumber)) {
            return NextResponse.json(
                { error: 'Invalid phone number format. Must be like 03001234567' },
                { status: 400 }
            );
        }

        // Amount validation
        const topupAmount = Number(amount);
        if (!topupAmount || topupAmount <= 0) {
            return NextResponse.json(
                { error: 'Amount must be greater than zero' },
                { status: 400 }
            );
        }

        // Telecom check karein
        const telecom = await prisma.telecom.findUnique({
            where: { code: telecomCode },
        });
        if (!telecom) {
            return NextResponse.json(
                { error: 'Invalid Telecom code. Choose JAZZ, ZONG, TELENOR, or UFONE' },
                { status: 400 }
            );
        }

        // Default Test User (Israr Ullah) fetch karein
        const user = await prisma.user.findUnique({
            where: { phone: '03001234567' },
            include: { wallet: true },
        });

        if (!user || !user.wallet) {
            return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
        }

        // 4. Promo Code Calculation (Junction Table Rule)
        let discountAmount = 0;
        let promoRecord = null;

        if (promoCode) {
            promoRecord = await prisma.promotion.findUnique({
                where: { code: promoCode },
                include: { rules: true },
            });

            if (!promoRecord || !promoRecord.isActive) {
                return NextResponse.json(
                    { error: 'Invalid or expired promotion code' },
                    { status: 400 }
                );
            }

            // Check Scenario 5: Promo Limit reached?
            if (promoRecord.currentUsage >= promoRecord.usageLimit) {
                return NextResponse.json(
                    { error: 'Promotion limit has already been reached' },
                    { status: 400 }
                );
            }

            // Junction Table se rule check karein
            const rule = promoRecord.rules.find((r) => r.telecomId === telecom.id);
            if (!rule) {
                return NextResponse.json(
                    { error: `Promo '${promoCode}' is not applicable for ${telecom.name}` },
                    { status: 400 }
                );
            }

            // Discount Calculate karein
            if (rule.discountType === 'PERCENTAGE') {
                const calculatedDiscount = (topupAmount * Number(rule.discountValue)) / 100;
                discountAmount = rule.maxCap
                    ? Math.min(calculatedDiscount, Number(rule.maxCap))
                    : calculatedDiscount;
            } else {
                discountAmount = Number(rule.discountValue);
            }
        }

        // Final payable amount calculate karein
        const finalAmount = Math.max(0, topupAmount - discountAmount);

        // 5. Sufficient Balance Check
        const currentBalance = Number(user.wallet.balance);
        if (currentBalance < finalAmount) {
            return NextResponse.json(
                {
                    error: `Insufficient wallet balance. Balance: Rs. ${currentBalance}, Required: Rs. ${finalAmount}`,
                },
                { status: 400 }
            );
        }

        // 6. Database Atomic Transaction (ACID Compliance)
        // Wallet debit aur Transaction creation aik sath hogi taake paise zaya na hon
        const result = await prisma.$transaction(async (tx) => {
            // Wallet se balance minus karein
            const updatedWallet = await tx.wallet.update({
                where: { id: user.wallet!.id },
                data: {
                    balance: { decrement: finalAmount },
                },
            });

            // Agar promo use hua toh counter barhayein
            if (promoRecord) {
                await tx.promotion.update({
                    where: { id: promoRecord.id },
                    data: { currentUsage: { increment: 1 } },
                });
            }

            // Transaction create karein
            const transaction = await tx.transaction.create({
                data: {
                    userId: user.id,
                    telecomId: telecom.id,
                    phoneNumber,
                    amount: topupAmount,
                    discountAmount,
                    finalAmount,
                    promoCode: promoCode || null,
                    status: 'COMPLETED',
                    idempotencyKey,
                },
                include: { telecom: true },
            });

            return { updatedWallet, transaction };
        });

        return NextResponse.json({
            success: true,
            message: `Top-up of Rs. ${topupAmount} successful on ${telecom.name} (${phoneNumber})`,
            newBalance: result.updatedWallet.balance,
            discountGiven: discountAmount,
            transaction: result.transaction,
        });
    } catch (error: any) {
        console.error('Top-up API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}