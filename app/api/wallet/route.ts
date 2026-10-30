import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// 1. GET: Dashboard ka Sara Data Fetch Karein (Scenario 2: Promise.all parallel style)
export async function GET() {
    try {
        const user = await prisma.user.findUnique({
            where: { phone: '03001234567' },
            include: {
                wallet: true,
            },
        });

        if (!user || !user.wallet) {
            return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
        }

        // Parallel fetch: Transactions, Telecoms, aur Active Promos aik sath
        const [transactions, telecoms, promotions] = await Promise.all([
            prisma.transaction.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 10, // Last 10 transactions
                include: { telecom: true },
            }),
            prisma.telecom.findMany(),
            prisma.promotion.findMany({
                where: { isActive: true },
                include: {
                    rules: {
                        include: { telecom: true },
                    },
                },
            }),
        ]);

        return NextResponse.json({
            user: {
                name: user.name,
                phone: user.phone,
            },
            wallet: {
                balance: user.wallet.balance,
                currency: user.wallet.currency,
            },
            transactions,
            telecoms,
            promotions,
        });
    } catch (error: any) {
        console.error('Wallet API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// 2. POST: Direct Deposit (Simulated / Fallback Deposit for Quick Testing)
export async function POST(req: Request) {
    try {
        const { amount } = await req.json();
        const depositAmount = Number(amount);

        if (!depositAmount || depositAmount <= 0) {
            return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { phone: '03001234567' },
            include: { wallet: true },
        });

        if (!user || !user.wallet) {
            return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
        }

        // Default telecom for deposit record
        const defaultTelecom = await prisma.telecom.findFirst();

        // Atomic Balance Update
        const updatedWallet = await prisma.wallet.update({
            where: { id: user.wallet.id },
            data: {
                balance: { increment: depositAmount },
            },
        });

        // Transaction History mein record
        await prisma.transaction.create({
            data: {
                userId: user.id,
                telecomId: defaultTelecom!.id,
                phoneNumber: user.phone,
                amount: depositAmount,
                discountAmount: 0,
                finalAmount: depositAmount,
                status: 'COMPLETED',
                promoCode: 'STRIPE_DEPOSIT',
            },
        });

        return NextResponse.json({
            success: true,
            message: `Successfully deposited Rs. ${depositAmount}`,
            newBalance: updatedWallet.balance,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}