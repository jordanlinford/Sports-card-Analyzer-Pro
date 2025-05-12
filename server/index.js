import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import admin from 'firebase-admin';
import fs from 'fs';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 1) Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: process.env.FRONTEND_URL + '/profile?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.FRONTEND_URL + '/profile',
      metadata: { userId },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2) Create Billing Portal Session
app.post('/api/create-portal-session', async (req, res) => {
  const { userId } = req.body;

  try {
    // Get the user's subscription from Firestore
    const subscriptionDoc = await db
      .collection('users')
      .doc(userId)
      .collection('subscriptions')
      .doc('active')
      .get();

    if (!subscriptionDoc.exists) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subscriptionDoc.data();
    
    // Create a Stripe customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: process.env.FRONTEND_URL + '/profile',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating portal session:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3) Stripe Webhook Handler
app.post('/api/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const subscriptionId = session.subscription;

        if (userId) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;

          // Update the user's subscription in Firestore
          await db.collection('users').doc(userId).collection('subscriptions').doc('active').set({
            subscriptionId,
            priceId,
            customerId: subscription.customer,
            status: 'active',
            currentPeriodEnd: subscription.current_period_end,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        if (userId) {
          // Update the user's subscription status in Firestore
          await db.collection('users').doc(userId).collection('subscriptions').doc('active').set({
            status: 'canceled',
            canceledAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }
        break;
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
