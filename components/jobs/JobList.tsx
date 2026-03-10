'use client';

import { Job } from '@/types/job';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
}

const statusColors = {
  quote: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  invoiced: 'bg-purple-100 text-purple-800',
  paid: 'bg-emerald-100 text-emerald-800',
};

const statusLabels = {
  quote: 'Quote',
  in_progress: 'In Progress',
  completed: 'Completed',
  invoiced: 'Invoiced',
  paid: 'Paid',
};

export default function JobList({ jobs, onEdit }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No jobs yet. Create your first job to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr
              key={job.id}
              onClick={() => onEdit(job)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 text-sm">
                <div className="font-medium text-gray-900">{job.title}</div>
                {job.invoiceNumber && (
                  <div className="text-xs text-gray-500">{job.invoiceNumber}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job.clientName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[job.status]}`}>
                  {statusLabels[job.status]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${job.totalAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
