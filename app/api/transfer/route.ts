import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { receiverPhone, receiverName, amount, purpose } = body;

        const transferAmount = Number(amount);
        if (!transferAmount || transferAmount <= 0) {
            return NextResponse.json(
                { error: 'Valid transfer amount is required (Minimum Rs. 10)' },
                { status: 400 }
            );
        }

        // Pakistani Phone Format Validation
        const pakPhoneRegex = /^03\d{9}$/;
        if (!receiverPhone || !pakPhoneRegex.test(receiverPhone)) {
            return NextResponse.json(
                { error: 'Invalid receiver phone number format. Must be like 03123456789' },
                { status: 400 }
            );
        }

        // Check if sending to own number
        const sender = await prisma.user.findUnique({
            where: { phone: '03001234567' },
            include: { wallet: true },
        });

        if (!sender || !sender.wallet) {
            return NextResponse.json({ error: 'Sender wallet not found' }, { status: 404 });
        }

        if (receiverPhone === sender.phone) {
            return NextResponse.json(
                { error: 'Cannot send money to your own phone number' },
                { status: 400 }
            );
        }

        // Check sufficient balance
        const currentBalance = Number(sender.wallet.balance);
        if (currentBalance < transferAmount) {
            return NextResponse.json(
                {
                    error: `Insufficient balance. Available: Rs. ${currentBalance}, Required: Rs. ${transferAmount}`,
                },
                { status: 400 }
            );
        }

        const defaultTelecom = await prisma.telecom.findFirst();
        const idempotencyKey = req.headers.get('idempotency-key') || crypto.randomUUID();

        // Atomic Transaction: Debit sender, credit receiver if registered, record transaction
        const result = await prisma.$transaction(async (tx) => {
            // Debit Sender
            const updatedSenderWallet = await tx.wallet.update({
                where: { id: sender.wallet!.id },
                data: {
                    balance: { decrement: transferAmount },
                },
            });

            // If receiver exists in system, credit them
            const receiver = await tx.user.findUnique({
                where: { phone: receiverPhone },
                include: { wallet: true },
            });

            if (receiver && receiver.wallet) {
                await tx.wallet.update({
                    where: { id: receiver.wallet.id },
                    data: { balance: { increment: transferAmount } },
                });
            }

            // Record Transaction
            const transaction = await tx.transaction.create({
                data: {
                    userId: sender.id,
                    telecomId: defaultTelecom!.id,
                    phoneNumber: receiverPhone,
                    amount: transferAmount,
                    discountAmount: 0,
                    finalAmount: transferAmount,
                    promoCode: `TRANSFER: ${receiverName ? receiverName.trim() : 'P2P'}`,
                    status: 'COMPLETED',
                    idempotencyKey,
                },
                include: { telecom: true },
            });

            return { updatedSenderWallet, transaction };
        });

        return NextResponse.json({
            success: true,
            message: `Successfully transferred Rs. ${transferAmount} to ${receiverName || 'Receiver'} (${receiverPhone})`,
            newBalance: result.updatedSenderWallet.balance,
            transaction: result.transaction,
        });
    } catch (error: any) {
        console.error('Money Transfer Error:', error);
        return NextResponse.json(
            { error: error.message || 'Money transfer failed' },
            { status: 500 }
        );
    }
}

