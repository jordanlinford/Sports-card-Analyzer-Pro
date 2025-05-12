import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase/admin';
import { initStripe } from '@/lib/stripe/init';

const stripe = initStripe();

// Map our tier IDs to Stripe price IDs
const STRIPE_PRICE_IDS = {
  star: {
    monthly: process.env.STRIPE_STAR_MONTHLY_PRICE_ID,
    annual: process.env.STRIPE_STAR_ANNUAL_PRICE_ID,
  },
  veteran: {
    monthly: process.env.STRIPE_VETERAN_MONTHLY_PRICE_ID,
    annual: process.env.STRIPE_VETERAN_ANNUAL_PRICE_ID,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tierId, interval, userId } = req.body;

    if (!tierId || !interval || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the appropriate price ID
    const priceId = process.env[`STRIPE_${tierId.toUpperCase()}_${interval.toUpperCase()}_PRICE_ID`];
    
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid tier or interval' });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile?canceled=true`,
      client_reference_id: userId,
      metadata: {
        tierId,
        interval,
        userId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Error creating checkout session' });
  }
} 