'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import JobForm from "@/components/jobs/JobForm";
import JobList from "@/components/jobs/JobList";
import { useAuth } from "@/contexts/AuthContext";
import { Job, JobFormData } from "@/types/job";
import { Client } from "@/types/client";
import { createJob, getJobs, updateJob, deleteJob, generateInvoiceNumber } from "@/lib/firebase/jobs";
import { getClients } from "@/lib/firebase/clients";

function JobsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle jobId from URL query parameter
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    if (jobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setEditingJob(job);
        setShowForm(false);
      }
    }
  }, [searchParams, jobs]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const [jobsResult, clientsResult] = await Promise.all([
      getJobs(user.uid),
      getClients(user.uid)
    ]);

    if (jobsResult.error) {
      setError(jobsResult.error);
    } else {
      setJobs(jobsResult.jobs);
    }

    if (clientsResult.error) {
      setError(clientsResult.error);
    } else {
      setClients(clientsResult.clients);
    }

    setLoading(false);
  };

  const handleCreate = async (data: JobFormData) => {
    if (!user) return;
    const client = clients.find(c => c.id === data.clientId);
    if (!client) return;

    const { error } = await createJob(user.uid, data, client.name);
    if (error) {
      setError(error);
    } else {
      setShowForm(false);
      loadData();
    }
  };

  const handleUpdate = async (data: JobFormData) => {
    if (!editingJob) return;
    const client = clients.find(c => c.id === data.clientId);

    const { error } = await updateJob(editingJob.id, data, client?.name);
    if (error) {
      setError(error);
    } else {
      setEditingJob(null);
      loadData();
    }
  };

  const handleDelete = async (jobId: string) => {
    const { error } = await deleteJob(jobId);
    if (error) {
      setError(error);
    } else {
      loadData();
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setShowForm(false);
  };

  const handleGenerateInvoice = async (job: Job) => {
    if (!user) return;

    const invoiceNumber = await generateInvoiceNumber(user.uid);
    const { error } = await updateJob(job.id, {
      ...job,
      status: 'invoiced',
      invoiceNumber,
      invoiceDate: new Date(),
    });

    if (error) {
      setError(error);
    } else {
      loadData();
    }
  };

  const handleViewQuote = (job: Job) => {
    // Open quote/invoice in new window for printing
    window.open(`/quote/${job.id}`, '_blank');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingJob(null);
              }}
              className="px-4 py-2 rounded-md font-semibold transition-colors"
              style={{
                backgroundColor: showForm ? '#857c8d' : '#96c5b0',
                color: '#191102'
              }}
            >
              {showForm ? 'Cancel' : '+ New Job'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}

          {clients.length === 0 && !loading && (
            <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
              You need to create clients before adding jobs.
            </div>
          )}

          {showForm && clients.length > 0 && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Create New Job</h2>
              <JobForm
                onSubmit={handleCreate}
                clients={clients}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {editingJob && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Edit Job</h2>
              <JobForm
                onSubmit={handleUpdate}
                clients={clients}
                initialData={editingJob}
                onCancel={() => setEditingJob(null)}
                onDelete={() => handleDelete(editingJob.id)}
                onEmailQuote={() => handleViewQuote(editingJob)}
                jobId={editingJob.id}
                jobStatus={editingJob.status}
              />
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : (
            <JobList
              jobs={jobs}
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <JobsContent />
    </Suspense>
  );
}
