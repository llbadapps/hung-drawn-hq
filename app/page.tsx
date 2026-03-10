'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import JobTimeline from "@/components/JobTimeline";
import { useEffect, useState } from "react";
import { Job } from "@/types/job";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'jobs'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
        completedDate: doc.data().completedDate?.toDate(),
        invoiceDate: doc.data().invoiceDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Job[];

      setJobs(jobsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <div className="max-w-full mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Project Timeline
            </h1>
            <div className="mt-2 h-1 w-24 rounded-full" style={{ backgroundColor: '#96c5b0' }}></div>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading jobs...</p>
            </div>
          ) : (
            <JobTimeline jobs={jobs} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
