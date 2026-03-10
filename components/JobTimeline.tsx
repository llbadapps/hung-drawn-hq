'use client';

import { useRef, useEffect } from 'react';
import { Job } from '@/types/job';
import { useRouter } from 'next/navigation';
import { Timeline } from 'vis-timeline';
import { DataSet } from 'vis-data';
import type { TimelineEventPropertiesResult } from 'vis-timeline';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

interface JobTimelineProps {
  jobs: Job[];
}

// Mint green progression: light to dark as job progresses
const statusColors: Record<string, string> = {
  quote: '#c9e4d4',       // Very light mint - just starting
  in_progress: '#a8d5be', // Light mint - in progress
  completed: '#96c5b0',   // Medium mint - completed
  invoiced: '#7db399',    // Darker mint - invoiced
  paid: '#5e9a7d',        // Darkest mint - fully paid
};

export default function JobTimeline({ jobs }: JobTimelineProps) {
  const router = useRouter();
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstanceRef = useRef<Timeline | null>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    // Group jobs by client
    const jobsByClient = jobs.reduce((acc, job) => {
      const clientId = job.clientId;
      if (!acc[clientId]) {
        acc[clientId] = {
          clientId,
          clientName: job.clientName,
          jobs: []
        };
      }
      acc[clientId].jobs.push(job);
      return acc;
    }, {} as Record<string, { clientId: string; clientName: string; jobs: Job[] }>);

    const clientGroups = Object.values(jobsByClient);

    // Create groups (one per client)
    const groupsArray = clientGroups.map(client => ({
      id: client.clientId,
      content: client.clientName,
    }));

    // Sort groups alphabetically
    groupsArray.sort((a, b) => a.content.localeCompare(b.content));

    // Create items (jobs)
    const itemsArray = jobs.map(job => {
      const start = job.startDate ? new Date(job.startDate) : new Date();
      const end = job.dueDate ? new Date(job.dueDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

      // All mint shades use dark text for consistency
      const color = statusColors[job.status] || '#96c5b0';
      const textColor = '#191102';

      return {
        id: job.id,
        group: job.clientId,
        content: job.title,
        start,
        end,
        title: `${job.title}\nClient: ${job.clientName}\nStatus: ${job.status}\nStart: ${start.toLocaleDateString()}\nEnd: ${end.toLocaleDateString()}`,
        type: 'range' as const,
        style: `background-color: ${color}; border: 2px solid ${color}; color: ${textColor}; font-weight: 600; border-radius: 4px;`,
        job_id: job.id,
        client_id: job.clientId,
      };
    });

    const groupsDataSet = new DataSet(groupsArray);
    const itemsDataSet = new DataSet(itemsArray);

    // Timeline options
    const options = {
      stack: true,
      editable: false,
      groupOrder: 'content',
      margin: {
        item: 12,
        axis: 24
      },
      zoomMin: 1000 * 60 * 60 * 24 * 7, // 1 week minimum
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 2, // 2 years maximum
      orientation: 'top' as const,
    };

    // Create or update timeline
    if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setOptions(options);
      timelineInstanceRef.current.setGroups(groupsDataSet);
      timelineInstanceRef.current.setItems(itemsDataSet);
    } else {
      timelineInstanceRef.current = new Timeline(timelineRef.current, itemsDataSet, groupsDataSet, options);

      // Add click event listener
      timelineInstanceRef.current.on('click', (properties: TimelineEventPropertiesResult) => {
        if (properties.item) {
          const clickedItem = itemsDataSet.get(properties.item);
          if (clickedItem && clickedItem.job_id) {
            router.push(`/jobs?jobId=${clickedItem.job_id}`);
          }
        } else if (properties.group) {
          // Clicked on client name/group
          router.push(`/clients?clientId=${properties.group}`);
        }
      });
    }

    // Cleanup
    return () => {
      if (timelineInstanceRef.current) {
        timelineInstanceRef.current.destroy();
        timelineInstanceRef.current = null;
      }
    };
  }, [jobs, router]);

  if (jobs.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">No jobs to display. Create a job to see it on the timeline.</p>
      </div>
    );
  }

  return (
    <div>
      <style jsx global>{`
        .vis-timeline {
          border: none !important;
          font-family: var(--font-sans), -apple-system, sans-serif !important;
          background: transparent !important;
        }

        .vis-label {
          background: transparent !important;
          color: #111d4a !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          border: none !important;
          border-right: none !important;
          cursor: pointer !important;
          letter-spacing: 0.02em !important;
        }

        .vis-labelset {
          border-right: none !important;
          background: transparent !important;
        }

        .vis-time-axis {
          border-top: none !important;
          background: transparent !important;
        }

        .vis-item {
          cursor: pointer !important;
        }

        .vis-item.vis-range {
          border-radius: 4px !important;
        }

        .vis-panel.vis-background {
          background: transparent !important;
        }

        .vis-panel.vis-center {
          background: transparent !important;
        }

        @media (prefers-color-scheme: dark) {
          .vis-label {
            background: transparent !important;
            color: white !important;
          }

          .vis-time-axis .vis-text {
            color: #9ca3af !important;
          }
        }
      `}</style>
      <div
        ref={timelineRef}
        style={{
          width: '100%',
          height: `${Math.max(400, jobs.length * 50)}px`
        }}
      />
    </div>
  );
}
