'use client';

import { useState, FormEvent, useEffect } from 'react';
import { JobFormData, LineItem, JobStatus, PricingType } from '@/types/job';
import { Client } from '@/types/client';

interface JobFormProps {
  onSubmit: (data: JobFormData) => Promise<void>;
  clients: Client[];
  initialData?: Partial<JobFormData>;
  onCancel?: () => void;
  onDelete?: () => void;
  onEmailQuote?: () => void;
  jobId?: string;
  jobStatus?: string;
}

export default function JobForm({ onSubmit, clients, initialData, onCancel, onDelete, onEmailQuote, jobId, jobStatus }: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    clientId: initialData?.clientId || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'quote',
    pricingType: initialData?.pricingType || 'fixed',
    hourlyRate: initialData?.hourlyRate,
    hoursWorked: initialData?.hoursWorked,
    fixedPrice: initialData?.fixedPrice,
    lineItems: initialData?.lineItems || [],
    startDate: initialData?.startDate || new Date(),
    dueDate: initialData?.dueDate,
    completedDate: initialData?.completedDate,
    invoiceNumber: initialData?.invoiceNumber,
    invoiceDate: initialData?.invoiceDate,
    paymentStatus: initialData?.paymentStatus || 'unpaid',
    paidAmount: initialData?.paidAmount || 0,
    notes: initialData?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [newLineItem, setNewLineItem] = useState({ description: '', quantity: '', rate: '' });

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    const updatedFormData = { ...formData, status: newStatus };
    setFormData(updatedFormData);

    // Auto-save when status changes (only for existing jobs)
    if (jobId) {
      setLoading(true);
      await onSubmit(updatedFormData);
      setLoading(false);
    }
  };

  const addLineItem = () => {
    const quantity = typeof newLineItem.quantity === 'string' ? parseFloat(newLineItem.quantity) : newLineItem.quantity;
    const rate = typeof newLineItem.rate === 'string' ? parseFloat(newLineItem.rate) : newLineItem.rate;

    if (!newLineItem.description || !quantity || !rate || rate <= 0) return;

    const item: LineItem = {
      id: Date.now().toString(),
      description: newLineItem.description,
      quantity,
      rate,
      total: quantity * rate,
    };

    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, item],
    });

    setNewLineItem({ description: '', quantity: '', rate: '' });
  };

  const removeLineItem = (id: string) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((item) => item.id !== id),
    });
  };

  const calculateTotal = () => {
    let total = 0;

    if (formData.pricingType === 'hourly' && formData.hourlyRate && formData.hoursWorked) {
      total += formData.hourlyRate * formData.hoursWorked;
    } else if (formData.pricingType === 'fixed' && formData.fixedPrice) {
      total += formData.fixedPrice;
    }

    total += formData.lineItems.reduce((sum, item) => sum + item.total, 0);

    return total;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

        {jobId && onEmailQuote && (jobStatus === 'quote' || jobStatus === 'invoiced') && (
          <button
            type="button"
            onClick={onEmailQuote}
            className="py-2 px-6 rounded-md font-semibold transition-colors"
            style={{ backgroundColor: '#96c5b0', color: '#191102' }}
          >
            View {jobStatus === 'quote' ? 'Quote' : 'Invoice'}
          </button>
        )}

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

        {jobId && onDelete && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this job?')) {
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

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client *
          </label>
          <select
            required
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="quote">Quote</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="invoiced">Invoiced</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Pricing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pricing Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="fixed"
              checked={formData.pricingType === 'fixed'}
              onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as PricingType })}
              className="mr-2"
            />
            Fixed Price
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="hourly"
              checked={formData.pricingType === 'hourly'}
              onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as PricingType })}
              className="mr-2"
            />
            Hourly Rate
          </label>
        </div>
      </div>

      {formData.pricingType === 'fixed' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fixed Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.fixedPrice || ''}
            onChange={(e) => setFormData({ ...formData, fixedPrice: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.hourlyRate || ''}
              onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hours Worked
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.hoursWorked || ''}
              onChange={(e) => setFormData({ ...formData, hoursWorked: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Line Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Line Items
        </label>
        <div className="space-y-2">
          {formData.lineItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="flex-1">{item.description}</span>
              <span className="text-sm text-gray-600">
                {item.quantity} × ${item.rate.toFixed(2)} = ${item.total.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => removeLineItem(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-12 gap-2">
          <input
            type="text"
            placeholder="Item description"
            value={newLineItem.description}
            onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
            className="col-span-6 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="number"
            placeholder="Quantity"
            min="1"
            value={newLineItem.quantity}
            onChange={(e) => setNewLineItem({ ...newLineItem, quantity: e.target.value })}
            className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="number"
            placeholder="Rate ($)"
            step="0.01"
            value={newLineItem.rate}
            onChange={(e) => setNewLineItem({ ...newLineItem, rate: e.target.value })}
            className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            type="button"
            onClick={addLineItem}
            className="col-span-2 bg-gray-200 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-300 text-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Total Display */}
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">Total:</span>
          <span className="font-bold text-2xl text-blue-600">${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
    </form>
  );
}
