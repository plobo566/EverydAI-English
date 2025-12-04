import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable the default body parser to receive the raw body for signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    let event;

    try {
        // Read the raw body
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        // Verify the event signature
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const supabaseUserId = session.metadata.supabase_user_id;

        if (supabaseUserId) {
            try {
                // Initialize Supabase client
                const supabase = createClient(
                    process.env.SUPABASE_URL,
                    process.env.SUPABASE_SERVICE_ROLE_KEY
                );

                // Update user profile to premium
                const { error } = await supabase
                    .from('profiles')
                    .update({ is_premium: true })
                    .eq('id', supabaseUserId);

                if (error) {
                    console.error('Supabase Update Error:', error);
                    return res.status(500).json({ error: 'Failed to update user profile' });
                }

                console.log(`User ${supabaseUserId} upgraded to premium.`);
            } catch (error) {
                console.error('Error updating Supabase:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            console.warn('No supabase_user_id found in session metadata.');
        }
    }

    res.status(200).json({ received: true });
}
