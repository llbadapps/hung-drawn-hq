import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Job, JobFormData } from '@/types/job';

const COLLECTION_NAME = 'jobs';

export const createJob = async (userId: string, data: JobFormData, clientName: string): Promise<{ id: string | null; error: string | null }> => {
  try {
    // Calculate total amount
    let totalAmount = 0;
    if (data.pricingType === 'hourly' && data.hourlyRate && data.hoursWorked) {
      totalAmount = data.hourlyRate * data.hoursWorked;
    } else if (data.pricingType === 'fixed' && data.fixedPrice) {
      totalAmount = data.fixedPrice;
    }

    // Add line items total
    const lineItemsTotal = data.lineItems.reduce((sum, item) => sum + item.total, 0);
    totalAmount += lineItemsTotal;

    // Clean data to remove undefined values (Firestore doesn't accept them)
    const cleanData: any = {
      clientId: data.clientId,
      clientName,
      title: data.title,
      description: data.description,
      status: data.status,
      pricingType: data.pricingType,
      lineItems: data.lineItems,
      paymentStatus: data.paymentStatus,
      paidAmount: data.paidAmount,
      totalAmount,
      userId,
      startDate: data.startDate instanceof Date ? Timestamp.fromDate(data.startDate) : data.startDate,
      dueDate: data.dueDate ? (data.dueDate instanceof Date ? Timestamp.fromDate(data.dueDate) : data.dueDate) : null,
      completedDate: data.completedDate ? (data.completedDate instanceof Date ? Timestamp.fromDate(data.completedDate) : data.completedDate) : null,
      invoiceDate: data.invoiceDate ? (data.invoiceDate instanceof Date ? Timestamp.fromDate(data.invoiceDate) : data.invoiceDate) : null,
      invoiceNumber: data.invoiceNumber || null,
      notes: data.notes || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Only add pricing fields if they have values
    if (data.hourlyRate !== undefined && data.hourlyRate !== null) {
      cleanData.hourlyRate = data.hourlyRate;
    }
    if (data.hoursWorked !== undefined && data.hoursWorked !== null) {
      cleanData.hoursWorked = data.hoursWorked;
    }
    if (data.fixedPrice !== undefined && data.fixedPrice !== null) {
      cleanData.fixedPrice = data.fixedPrice;
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

export const getJobs = async (userId: string): Promise<{ jobs: Job[]; error: string | null }> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const jobs: Job[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate(),
        dueDate: data.dueDate?.toDate(),
        completedDate: data.completedDate?.toDate(),
        invoiceDate: data.invoiceDate?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Job;
    });
    return { jobs, error: null };
  } catch (error: any) {
    return { jobs: [], error: error.message };
  }
};

export const getJobsByClient = async (userId: string, clientId: string): Promise<{ jobs: Job[]; error: string | null }> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const jobs: Job[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate(),
        dueDate: data.dueDate?.toDate(),
        completedDate: data.completedDate?.toDate(),
        invoiceDate: data.invoiceDate?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Job;
    });
    return { jobs, error: null };
  } catch (error: any) {
    return { jobs: [], error: error.message };
  }
};

export const updateJob = async (jobId: string, data: Partial<JobFormData>, clientName?: string): Promise<{ error: string | null }> => {
  try {
    // Build clean update data without undefined values
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (clientName) {
      updateData.clientName = clientName;
    }

    // Only add fields that are defined
    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.pricingType !== undefined) updateData.pricingType = data.pricingType;
    if (data.lineItems !== undefined) updateData.lineItems = data.lineItems;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.invoiceNumber !== undefined) updateData.invoiceNumber = data.invoiceNumber;

    // Only add pricing fields if they have values
    if (data.hourlyRate !== undefined && data.hourlyRate !== null) {
      updateData.hourlyRate = data.hourlyRate;
    }
    if (data.hoursWorked !== undefined && data.hoursWorked !== null) {
      updateData.hoursWorked = data.hoursWorked;
    }
    if (data.fixedPrice !== undefined && data.fixedPrice !== null) {
      updateData.fixedPrice = data.fixedPrice;
    }

    // Convert dates to Timestamps
    if (data.startDate) {
      updateData.startDate = data.startDate instanceof Date ? Timestamp.fromDate(data.startDate) : data.startDate;
    }
    if (data.dueDate) {
      updateData.dueDate = data.dueDate instanceof Date ? Timestamp.fromDate(data.dueDate) : data.dueDate;
    }
    if (data.completedDate) {
      updateData.completedDate = data.completedDate instanceof Date ? Timestamp.fromDate(data.completedDate) : data.completedDate;
    }
    if (data.invoiceDate) {
      updateData.invoiceDate = data.invoiceDate instanceof Date ? Timestamp.fromDate(data.invoiceDate) : data.invoiceDate;
    }

    // Recalculate total if pricing data changed
    if (data.pricingType || data.hourlyRate !== undefined || data.hoursWorked !== undefined ||
        data.fixedPrice !== undefined || data.lineItems) {
      const jobRef = doc(db, COLLECTION_NAME, jobId);
      const jobSnap = await getDoc(jobRef);
      const currentJob = jobSnap.data() as Job;

      let totalAmount = 0;
      const pricingType = data.pricingType || currentJob.pricingType;

      if (pricingType === 'hourly') {
        const hourlyRate = data.hourlyRate !== undefined ? data.hourlyRate : currentJob.hourlyRate;
        const hoursWorked = data.hoursWorked !== undefined ? data.hoursWorked : currentJob.hoursWorked;
        if (hourlyRate && hoursWorked) {
          totalAmount = hourlyRate * hoursWorked;
        }
      } else if (pricingType === 'fixed') {
        const fixedPrice = data.fixedPrice !== undefined ? data.fixedPrice : currentJob.fixedPrice;
        if (fixedPrice) {
          totalAmount = fixedPrice;
        }
      }

      const lineItems = data.lineItems || currentJob.lineItems;
      const lineItemsTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
      totalAmount += lineItemsTotal;

      updateData.totalAmount = totalAmount;
    }

    const jobRef = doc(db, COLLECTION_NAME, jobId);
    await updateDoc(jobRef, updateData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const deleteJob = async (jobId: string): Promise<{ error: string | null }> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, jobId));
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const generateInvoiceNumber = async (userId: string): Promise<string> => {
  const year = new Date().getFullYear();
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('invoiceNumber', '!=', null)
  );
  const snapshot = await getDocs(q);
  const invoiceCount = snapshot.size + 1;
  return `INV-${year}-${String(invoiceCount).padStart(4, '0')}`;
};
