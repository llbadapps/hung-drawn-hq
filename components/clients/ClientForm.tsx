'use client';

import { useState, FormEvent } from 'react';
import { ClientFormData } from '@/types/client';

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => Promise<void>;
  initialData?: ClientFormData;
  onCancel?: () => void;
  onDelete?: () => void;
  clientId?: string;
}

export default function ClientForm({ onSubmit, initialData, onCancel, onDelete, clientId }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: '',
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Action Buttons at Top */}
      <div className="flex gap-3 pb-4 border-b">
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-6 rounded-md font-semibold disabled:opacity-50 transition-colors"
          style={{ backgroundColor: '#111d4a', color: 'white' }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-6 rounded-md font-semibold transition-colors"
            style={{ backgroundColor: '#857c8d', color: 'white' }}
          >
            Cancel
          </button>
        )}

        {onDelete && clientId && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this client?')) {
                onDelete();
              }
            }}
            className="ml-auto py-2 px-6 rounded-md font-semibold transition-colors"
            style={{ backgroundColor: '#510d0a', color: 'white' }}
          >
            Delete
          </button>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone *
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          id="company"
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

    </form>
  );
}
