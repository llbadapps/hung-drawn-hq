'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Job } from '@/types/job';

export default function QuotePage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      if (!params.id || typeof params.id !== 'string') return;

      const jobRef = doc(db, 'jobs', params.id);
      const jobSnap = await getDoc(jobRef);

      if (jobSnap.exists()) {
        const data = jobSnap.data();
        setJob({
          id: jobSnap.id,
          ...data,
          startDate: data.startDate?.toDate(),
          dueDate: data.dueDate?.toDate(),
          completedDate: data.completedDate?.toDate(),
          invoiceDate: data.invoiceDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Job);
      }
      setLoading(false);
    };

    loadJob();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Quote/Invoice not found</p>
      </div>
    );
  }

  const documentType = job.status === 'invoiced' || job.status === 'paid' ? 'Invoice' : 'Quote';

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          {/* Print Button */}
          <div className="no-print p-4 bg-gray-50 border-b flex justify-end">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Print / Save as PDF
            </button>
          </div>

          {/* Document Content */}
          <div className="p-12">
            {/* Header */}
            <div className="border-b-4 border-blue-600 pb-8 mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">HDQ Creative</h1>
              <p className="text-xl text-gray-600">Hung Drawn Quartered Creative</p>
            </div>

            {/* Document Type & Number */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{documentType}</h2>
                {job.invoiceNumber && (
                  <p className="text-lg text-gray-600">{job.invoiceNumber}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-gray-600">
                  <span className="font-semibold">Date:</span>{' '}
                  {job.invoiceDate
                    ? new Date(job.invoiceDate).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </p>
                {job.dueDate && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Due Date:</span>{' '}
                    {new Date(job.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
              <p className="text-gray-700 font-medium">{job.clientName}</p>
            </div>

            {/* Job Details */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h3>
              {job.description && (
                <p className="text-gray-700 mb-4">{job.description}</p>
              )}
            </div>

            {/* Pricing Details */}
            {(job.pricingType === 'hourly' || job.pricingType === 'fixed') && (
              <div className="mb-6 bg-gray-50 p-4 rounded">
                {job.pricingType === 'hourly' && job.hourlyRate && job.hoursWorked ? (
                  <>
                    <p className="text-gray-700">
                      <span className="font-semibold">Hourly Rate:</span> ${job.hourlyRate.toFixed(2)}/hour
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Hours Worked:</span> {job.hoursWorked}
                    </p>
                    <p className="text-gray-700 font-semibold mt-2">
                      Subtotal: ${(job.hourlyRate * job.hoursWorked).toFixed(2)}
                    </p>
                  </>
                ) : job.pricingType === 'fixed' && job.fixedPrice ? (
                  <p className="text-gray-700">
                    <span className="font-semibold">Fixed Price:</span> ${job.fixedPrice.toFixed(2)}
                  </p>
                ) : null}
              </div>
            )}

            {/* Line Items */}
            {job.lineItems && job.lineItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Qty</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">${item.rate.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notes */}
            {job.notes && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.notes}</p>
              </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    Total: ${job.totalAmount.toFixed(2)}
                  </p>
                  {job.paymentStatus !== 'paid' && (
                    <p className="text-sm text-gray-600 mt-2">
                      Payment Status: {job.paymentStatus.charAt(0).toUpperCase() + job.paymentStatus.slice(1)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
