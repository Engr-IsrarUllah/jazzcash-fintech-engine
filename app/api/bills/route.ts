import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { company, consumerNumber, amount, billType } = body;

        const billAmount = Number(amount);
        if (!billAmount || billAmount <= 0) {
            return NextResponse.json(
                { error: 'Valid bill amount is required' },
                { status: 400 }
            );
        }

        if (!consumerNumber || consumerNumber.trim().length < 6) {
            return NextResponse.json(
                { error: 'Valid Consumer Reference Number is required (Minimum 6 digits)' },
                { status: 400 }
            );
        }

        const sender = await prisma.user.findUnique({
            where: { phone: '03001234567' },
            include: { wallet: true },
        });

        if (!sender || !sender.wallet) {
            return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
        }

        // Check sufficient balance
        const currentBalance = Number(sender.wallet.balance);
        if (currentBalance < billAmount) {
            return NextResponse.json(
                {
                    error: `Insufficient balance to pay bill. Available: Rs. ${currentBalance}, Bill: Rs. ${billAmount}`,
                },
                { status: 400 }
            );
        }

        const defaultTelecom = await prisma.telecom.findFirst();
        const idempotencyKey = req.headers.get('idempotency-key') || crypto.randomUUID();

        // Atomic Transaction: Debit wallet & create bill payment transaction
        const result = await prisma.$transaction(async (tx) => {
            const updatedWallet = await tx.wallet.update({
                where: { id: sender.wallet!.id },
                data: {
                    balance: { decrement: billAmount },
                },
            });

            const transaction = await tx.transaction.create({
                data: {
                    userId: sender.id,
                    telecomId: defaultTelecom!.id,
                    phoneNumber: consumerNumber.trim(),
                    amount: billAmount,
                    discountAmount: 0,
                    finalAmount: billAmount,
                    promoCode: `BILL: ${company || billType || 'Utility'}`,
                    status: 'COMPLETED',
                    idempotencyKey,
                },
                include: { telecom: true },
            });

            return { updatedWallet, transaction };
        });

        return NextResponse.json({
            success: true,
            message: `Bill of Rs. ${billAmount} paid successfully to ${company} (Ref: ${consumerNumber})`,
            newBalance: result.updatedWallet.balance,
            transaction: result.transaction,
        });
    } catch (error: any) {
        console.error('Bill Payment Error:', error);
        return NextResponse.json(
            { error: error.message || 'Bill payment failed' },
            { status: 500 }
        );
    }
}

