'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ClientForm from "@/components/clients/ClientForm";
import ClientList from "@/components/clients/ClientList";
import { useAuth } from "@/contexts/AuthContext";
import { Client, ClientFormData } from "@/types/client";
import { createClient, getClients, updateClient, deleteClient } from "@/lib/firebase/clients";

function ClientsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClients();
  }, [user]);

  // Handle clientId from URL query parameter
  useEffect(() => {
    const clientId = searchParams.get('clientId');
    if (clientId && clients.length > 0) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setEditingClient(client);
        setShowForm(false);
      }
    }
  }, [searchParams, clients]);

  const loadClients = async () => {
    if (!user) return;
    setLoading(true);
    const { clients, error } = await getClients(user.uid);
    if (error) {
      setError(error);
    } else {
      setClients(clients);
    }
    setLoading(false);
  };

  const handleCreate = async (data: ClientFormData) => {
    if (!user) return;
    const { error } = await createClient(user.uid, data);
    if (error) {
      setError(error);
    } else {
      setShowForm(false);
      loadClients();
    }
  };

  const handleUpdate = async (data: ClientFormData) => {
    if (!editingClient) return;
    const { error } = await updateClient(editingClient.id, data);
    if (error) {
      setError(error);
    } else {
      setEditingClient(null);
      loadClients();
    }
  };

  const handleDelete = async (clientId: string) => {
    const { error } = await deleteClient(clientId);
    if (error) {
      setError(error);
    } else {
      loadClients();
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingClient(null);
              }}
              className="px-4 py-2 rounded-md font-semibold transition-colors"
              style={{
                backgroundColor: showForm ? '#857c8d' : '#96c5b0',
                color: '#191102'
              }}
            >
              {showForm ? 'Cancel' : '+ New Client'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}

          {showForm && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Create New Client</h2>
              <ClientForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {editingClient && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Edit Client</h2>
              <ClientForm
                onSubmit={handleUpdate}
                initialData={editingClient}
                onCancel={() => setEditingClient(null)}
                onDelete={() => handleDelete(editingClient.id)}
                clientId={editingClient.id}
              />
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading clients...</p>
            </div>
          ) : (
            <ClientList
              clients={clients}
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <ClientsContent />
    </Suspense>
  );
}
