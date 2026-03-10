'use client';

import { useState } from 'react';
import { collection, addDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateDummyJobs() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const clientTemplates = [
    { name: 'Acme Corp', email: 'contact@acmecorp.com', phone: '555-0101', company: 'Acme Corp' },
    { name: 'TechStart Inc', email: 'hello@techstart.com', phone: '555-0102', company: 'TechStart Inc' },
    { name: 'Creative Studios', email: 'info@creativestudios.com', phone: '555-0103', company: 'Creative Studios' },
    { name: 'Global Enterprises', email: 'contact@globalent.com', phone: '555-0104', company: 'Global Enterprises' },
    { name: 'LocalBiz LLC', email: 'hello@localbiz.com', phone: '555-0105', company: 'LocalBiz LLC' },
  ];

  const jobTemplates = [
    { title: 'Website Redesign', status: 'in_progress' as const, duration: 30 },
    { title: 'Logo Design', status: 'quote' as const, duration: 14 },
    { title: 'Marketing Campaign', status: 'in_progress' as const, duration: 45 },
    { title: 'Mobile App Development', status: 'in_progress' as const, duration: 90 },
    { title: 'Brand Guidelines', status: 'completed' as const, duration: 21 },
    { title: 'Social Media Graphics', status: 'invoiced' as const, duration: 7 },
    { title: 'Product Photography', status: 'paid' as const, duration: 3 },
    { title: 'E-commerce Platform', status: 'in_progress' as const, duration: 60 },
    { title: 'SEO Optimization', status: 'quote' as const, duration: 30 },
    { title: 'Annual Report Design', status: 'completed' as const, duration: 14 },
  ];

  const createDummyJobs = async () => {
    if (!user) {
      setMessage('Please log in first');
      return;
    }

    setLoading(true);
    setMessage('Creating dummy clients and jobs...');

    try {
      const today = new Date();
      const createdClients: { id: string; name: string }[] = [];

      // First, create or get clients
      for (const clientTemplate of clientTemplates) {
        // Check if client already exists
        const clientQuery = query(
          collection(db, 'clients'),
          where('userId', '==', user.uid),
          where('email', '==', clientTemplate.email)
        );
        const clientSnapshot = await getDocs(clientQuery);

        let clientId: string;
        if (clientSnapshot.empty) {
          // Create new client
          const clientDoc = await addDoc(collection(db, 'clients'), {
            ...clientTemplate,
            notes: 'Dummy client for testing',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            userId: user.uid,
          });
          clientId = clientDoc.id;
        } else {
          // Use existing client
          clientId = clientSnapshot.docs[0].id;
        }

        createdClients.push({ id: clientId, name: clientTemplate.name });
      }

      // Now create jobs
      for (let i = 0; i < 10; i++) {
        const client = createdClients[i % createdClients.length];
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
          userId: user.uid,
        };

        await addDoc(collection(db, 'jobs'), job);
      }

      setMessage('✓ Successfully created dummy clients and 10 jobs!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error creating dummy data:', error);
      setMessage('✗ Error creating data. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const deleteDummyJobs = async () => {
    if (!user) return;

    if (!confirm('Delete all dummy jobs and clients?')) return;

    setLoading(true);
    setMessage('Deleting dummy data...');

    try {
      const { deleteDoc, doc: docRef } = require('firebase/firestore');

      // Delete dummy jobs
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('userId', '==', user.uid),
        where('notes', '==', 'Dummy job for testing timeline')
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobDeletePromises = jobsSnapshot.docs.map(doc =>
        deleteDoc(docRef(db, 'jobs', doc.id))
      );
      await Promise.all(jobDeletePromises);

      // Delete dummy clients
      const clientsQuery = query(
        collection(db, 'clients'),
        where('userId', '==', user.uid),
        where('notes', '==', 'Dummy client for testing')
      );
      const clientsSnapshot = await getDocs(clientsQuery);
      const clientDeletePromises = clientsSnapshot.docs.map(doc =>
        deleteDoc(docRef(db, 'clients', doc.id))
      );
      await Promise.all(clientDeletePromises);

      setMessage(`✓ Deleted ${jobsSnapshot.size} jobs and ${clientsSnapshot.size} clients`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting dummy data:', error);
      setMessage('✗ Error deleting data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-yellow-900 mb-2">Development Tools</h3>
      <p className="text-sm text-yellow-800 mb-3">
        Create dummy clients and jobs to test the timeline (remove this component before production)
      </p>
      <div className="flex gap-2">
        <button
          onClick={createDummyJobs}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          Create Dummy Data
        </button>
        <button
          onClick={deleteDummyJobs}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          Delete Dummy Data
        </button>
      </div>
      {message && <p className="mt-2 text-sm font-medium text-yellow-900">{message}</p>}
    </div>
  );
}
