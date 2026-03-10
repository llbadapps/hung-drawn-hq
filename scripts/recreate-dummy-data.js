require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const clientTemplates = [
  { name: 'Acme Corp', email: 'contact@acmecorp.com', phone: '555-0101', company: 'Acme Corp' },
  { name: 'TechStart Inc', email: 'hello@techstart.com', phone: '555-0102', company: 'TechStart Inc' },
  { name: 'Creative Studios', email: 'info@creativestudios.com', phone: '555-0103', company: 'Creative Studios' },
  { name: 'Global Enterprises', email: 'contact@globalent.com', phone: '555-0104', company: 'Global Enterprises' },
  { name: 'LocalBiz LLC', email: 'hello@localbiz.com', phone: '555-0105', company: 'LocalBiz LLC' },
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

async function recreateDummyData(userId) {
  console.log('🗑️  Deleting old dummy data...');

  // Delete old dummy jobs
  const jobsQuery = query(
    collection(db, 'jobs'),
    where('userId', '==', userId),
    where('notes', '==', 'Dummy job for testing timeline')
  );
  const jobsSnapshot = await getDocs(jobsQuery);
  for (const jobDoc of jobsSnapshot.docs) {
    await deleteDoc(doc(db, 'jobs', jobDoc.id));
  }
  console.log(`   Deleted ${jobsSnapshot.size} old jobs`);

  // Delete old dummy clients
  const clientsQuery = query(
    collection(db, 'clients'),
    where('userId', '==', userId),
    where('notes', '==', 'Dummy client for testing')
  );
  const clientsSnapshot = await getDocs(clientsQuery);
  for (const clientDoc of clientsSnapshot.docs) {
    await deleteDoc(doc(db, 'clients', clientDoc.id));
  }
  console.log(`   Deleted ${clientsSnapshot.size} old clients\n`);

  console.log('✨ Creating new dummy data...');

  const createdClients = [];

  // Create clients
  for (const clientTemplate of clientTemplates) {
    const clientDoc = await addDoc(collection(db, 'clients'), {
      ...clientTemplate,
      notes: 'Dummy client for testing',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId: userId,
    });
    createdClients.push({ id: clientDoc.id, name: clientTemplate.name });
    console.log(`   ✓ Created client: ${clientTemplate.name}`);
  }

  console.log('');

  // Create jobs
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const client = createdClients[i % createdClients.length];
    const template = jobTemplates[i];

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + (i * 8) - 40);

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
      userId: userId,
    };

    await addDoc(collection(db, 'jobs'), job);
    console.log(`   ✓ Created job: ${template.title} (${client.name})`);
  }

  console.log('\n✅ Done! Created 5 clients and 10 jobs');
}

async function findUserId() {
  // Try to find any existing job to get userId
  const jobsSnapshot = await getDocs(collection(db, 'jobs'));
  if (!jobsSnapshot.empty) {
    return jobsSnapshot.docs[0].data().userId;
  }

  // Try to find any existing client to get userId
  const clientsSnapshot = await getDocs(collection(db, 'clients'));
  if (!clientsSnapshot.empty) {
    return clientsSnapshot.docs[0].data().userId;
  }

  return null;
}

async function main() {
  let userId = process.argv[2];

  if (!userId) {
    console.log('🔍 No userId provided, searching for existing data...');
    userId = await findUserId();

    if (!userId) {
      console.error('❌ Error: Could not find userId. Please provide it as an argument:');
      console.error('Usage: node scripts/recreate-dummy-data.js <userId>');
      process.exit(1);
    }

    console.log(`   Found userId: ${userId}\n`);
  }

  await recreateDummyData(userId);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
