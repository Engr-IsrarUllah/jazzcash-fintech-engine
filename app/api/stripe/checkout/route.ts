import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const { amount } = await req.json();
        const depositAmount = Number(amount);

        // Stripe requires a charge amount equivalent to at least $0.50 USD (~Rs. 150-200)
        if (!depositAmount || depositAmount < 200) {
            return NextResponse.json(
                { error: 'Minimum deposit amount is Rs. 200 (Stripe international processing limit)' },
                { status: 400 }
            );
        }

        // Check agar .env mein mock key hai
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
            return NextResponse.json({
                simulated: true,
                message: 'Stripe Test Mode Simulated (No real key provided in .env)',
                amount: depositAmount,
            });
        }

        const origin = req.headers.get('origin') || 'http://localhost:3000';

        // Stripe Checkout Session Create Karein
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'pkr',
                        product_data: {
                            name: 'JazzCash Wallet Deposit',
                            description: 'Adding funds to digital wallet via Stripe Checkout',
                        },
                        unit_amount: Math.round(depositAmount * 100), // Stripe takes amount in paisas
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/?deposit=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/?deposit=cancelled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Stripe Session Failed' },
            { status: 500 }
        );
    }
}
