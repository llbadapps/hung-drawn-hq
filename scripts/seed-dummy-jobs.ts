// Script to create dummy jobs for testing the timeline
// Run with: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-dummy-jobs.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// You'll need to add your Firebase config here
const firebaseConfig = {
  // Add your config from .env.local or Firebase console
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Replace with your actual user ID
const USER_ID = 'YOUR_USER_ID_HERE';

const clients = [
  { id: 'client1', name: 'Acme Corp' },
  { id: 'client2', name: 'TechStart Inc' },
  { id: 'client3', name: 'Creative Studios' },
  { id: 'client4', name: 'Global Enterprises' },
  { id: 'client5', name: 'LocalBiz LLC' },
];

const jobTemplates = [
  { title: 'Website Redesign', status: 'in_progress', duration: 30 },
  { title: 'Logo Design', status: 'quote', duration: 14 },
  { title: 'Marketing Campaign', status: 'in_progress', duration: 45 },
  { title: 'Mobile App Development', status: 'in_progress', duration: 90 },
  { title: 'Brand Guidelines', status: 'completed', duration: 21 },
  { title: 'Social Media Graphics', status: 'invoiced', duration: 7 },
  { title: 'Product Photography', status: 'paid', duration: 3 },
  { title: 'E-commerce Platform', status: 'in_progress', duration: 60 },
  { title: 'SEO Optimization', status: 'quote', duration: 30 },
  { title: 'Annual Report Design', status: 'completed', duration: 14 },
];

async function createDummyJobs() {
  console.log('Creating dummy jobs...');

  const today = new Date();

  for (let i = 0; i < 10; i++) {
    const client = clients[i % clients.length];
    const template = jobTemplates[i];

    // Stagger start dates across the past and future
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + (i * 8) - 40); // Spread from -40 to +40 days

    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + template.duration);

    const fixedPrice = Math.floor(Math.random() * 5000) + 1000;

    const job = {
      clientId: client.id,
      clientName: client.name,
      title: template.title,
      description: `Project work for ${client.name} - ${template.title}`,
      status: template.status,
      pricingType: 'fixed',
      fixedPrice,
      lineItems: [],
      startDate: Timestamp.fromDate(startDate),
      dueDate: Timestamp.fromDate(dueDate),
      paymentStatus: 'unpaid',
      paidAmount: 0,
      totalAmount: fixedPrice,
      notes: 'Dummy job for testing timeline',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId: USER_ID,
    };

    try {
      const docRef = await addDoc(collection(db, 'jobs'), job);
      console.log(`✓ Created job: ${template.title} for ${client.name} (${docRef.id})`);
    } catch (error) {
      console.error(`✗ Failed to create job: ${template.title}`, error);
    }
  }

  console.log('Done!');
  process.exit(0);
}

createDummyJobs();
