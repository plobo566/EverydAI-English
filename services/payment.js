const PaymentService = {
    async startPremiumCheckout() {
        try {
            // 1. Check if user is logged in
            const user = await AuthService.getCurrentUser();
            if (!user) {
                alert('Please log in to upgrade to Premium.');
                // Optionally redirect to login tab if you have a way to do so programmatically
                // For now, the alert is sufficient or we can dispatch an event
                document.dispatchEvent(new CustomEvent('auth-mode-change', { detail: { mode: 'login' } }));
                return;
            }

            // 2. Call the backend to create a checkout session
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: 'price_1234567890', // Ideally this comes from config or backend, but for now we rely on backend env var mostly, though backend expects it in body?
                    // Wait, backend implementation:
                    // const { priceId, userId, userEmail } = req.body;
                    // line_items: [{ price: process.env.STRIPE_PRICE_ID, ... }]
                    // Actually backend uses process.env.STRIPE_PRICE_ID for the price, 
                    // but it extracts priceId from body? 
                    // Let's check api/create-checkout.js again.
                    // "line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }]"
                    // So the priceId in body is unused in the backend code I wrote?
                    // "const { priceId, userId, userEmail } = req.body;"
                    // It extracts it but doesn't seem to use it in line_items.
                    // It uses process.env.STRIPE_PRICE_ID.
                    // So I can send anything or nothing for priceId.
                    userId: user.id,
                    userEmail: user.email
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to initiate checkout');
            }

            const { url } = await response.json();

            // 3. Redirect to Stripe
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error) {
            console.error('Payment Error:', error);
            alert('Failed to start payment process. Please try again.');
        }
    }
};

window.PaymentService = PaymentService;
