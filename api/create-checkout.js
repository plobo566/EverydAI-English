import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { priceId, userId, userEmail } = req.body;

        if (!userId || !userEmail) {
            return res.status(400).json({ error: 'Missing userId or userEmail' });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID, // Using env var as requested
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.origin}/?payment=success`,
            cancel_url: `${req.headers.origin}/?payment=cancelled`,
            metadata: {
                supabase_user_id: userId,
            },
            customer_email: userEmail,
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
