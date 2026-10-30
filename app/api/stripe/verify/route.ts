import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const sessionId = req.nextUrl.searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // Retrieve Stripe Checkout Session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Payment has not been completed' },
                { status: 400 }
            );
        }

        const depositAmount = (session.amount_total || 0) / 100;

        // Find user
        const user = await prisma.user.findUnique({
            where: { phone: '03001234567' },
            include: { wallet: true },
        });

        if (!user || !user.wallet) {
            return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
        }

        // Check if this Stripe session was already credited (Idempotency)
        const existingTx = await prisma.transaction.findFirst({
            where: { stripeId: sessionId },
        });

        if (existingTx) {
            return NextResponse.json({
                alreadyCredited: true,
                message: 'Deposit already credited to wallet',
                amount: depositAmount,
                newBalance: user.wallet.balance,
            });
        }

        // Default Telecom
        const defaultTelecom = await prisma.telecom.findFirst();

        // Atomically increment wallet and create transaction
        const result = await prisma.$transaction(async (tx) => {
            const updatedWallet = await tx.wallet.update({
                where: { id: user.wallet!.id },
                data: {
                    balance: { increment: depositAmount },
                },
            });

            const transaction = await tx.transaction.create({
                data: {
                    userId: user.id,
                    telecomId: defaultTelecom!.id,
                    phoneNumber: user.phone,
                    amount: depositAmount,
                    discountAmount: 0,
                    finalAmount: depositAmount,
                    status: 'COMPLETED',
                    promoCode: 'STRIPE_DEPOSIT',
                    stripeId: sessionId,
                },
            });

            return { updatedWallet, transaction };
        });

        return NextResponse.json({
            success: true,
            message: `Successfully deposited Rs. ${depositAmount} via Stripe`,
            amount: depositAmount,
            newBalance: result.updatedWallet.balance,
        });
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_')) {
            throw error;
        }
        console.error('Stripe Verification Error:', error);
        return NextResponse.json(
            { error: error.message || 'Verification failed' },
            { status: 500 }
        );
    }
}
