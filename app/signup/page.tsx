'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/firebase/auth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createDummyData = async (userId: string) => {
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

    const createdClients: { id: string; name: string }[] = [];

    // Create clients
    for (const clientTemplate of clientTemplates) {
      const clientDoc = await addDoc(collection(db, 'clients'), {
        ...clientTemplate,
        notes: 'Sample client - feel free to edit or delete',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId,
      });
      createdClients.push({ id: clientDoc.id, name: clientTemplate.name });
    }

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

      await addDoc(collection(db, 'jobs'), {
        clientId: client.id,
        clientName: client.name,
        title: template.title,
        description: `Sample project for ${client.name} - ${template.title}`,
        status: template.status,
        pricingType: 'fixed',
        fixedPrice,
        lineItems: [],
        startDate: Timestamp.fromDate(startDate),
        dueDate: Timestamp.fromDate(dueDate),
        paymentStatus: 'unpaid',
        paidAmount: 0,
        totalAmount: fixedPrice,
        notes: 'Sample job - feel free to edit or delete',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId,
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { user, error } = await signUp(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    } else if (user) {
      // Create sample data
      await createDummyData(user.uid);

      setSuccess('Account created! Please check your email to verify your account. You can still use the app while unverified.');

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password (min 6 characters)"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
