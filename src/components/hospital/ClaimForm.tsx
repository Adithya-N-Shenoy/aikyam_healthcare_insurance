'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import { INSURANCE_COMPANIES } from '@/lib/constants/insuranceCompanies';
import toast from 'react-hot-toast';

const claimFormSchema = z.object({
  companyId: z.string().min(1, 'Insurance company is required'),
  
  // Patient Information
  patientName: z.string().min(1, 'Patient name is required'),
  patientDob: z.string().min(1, 'Date of birth is required'),
  patientGender: z.enum(['Male', 'Female', 'Other']),
  patientPhone: z.string().min(10, 'Valid phone number is required'),
  patientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  policyNumber: z.string().min(1, 'Policy number is required'),
  patientAddress: z.string().optional(),
  
  // Admission Details
  admissionDate: z.string().min(1, 'Admission date is required'),
  dischargeDate: z.string().optional(),
  admissionType: z.enum(['planned', 'emergency']),
  
  // Hospital Staff
  staffName: z.string().min(1, 'Staff name is required'),
  staffDesignation: z.string().min(1, 'Designation is required'),
  staffPhone: z.string().min(10, 'Valid phone number is required'),
  staffEmail: z.string().email('Invalid email').min(1, 'Email is required'),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface ClaimFormProps {
  initialData?: Partial<ClaimFormData>;
  onSubmit: (data: ClaimFormData) => void;
  onBack: () => void;
}

export default function ClaimForm({ initialData, onSubmit, onBack }: ClaimFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: initialData || {
      patientGender: 'Male',
      admissionType: 'planned'
    }
  });

  const admissionDate = watch('admissionDate');
  const dischargeDate = watch('dischargeDate');

  const calculateLengthOfStay = () => {
    if (admissionDate && dischargeDate) {
      const start = new Date(admissionDate);
      const end = new Date(dischargeDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const onFormSubmit = async (data: ClaimFormData) => {
    setIsSubmitting(true);
    try {
      // Find the company code from the selected ID
      const selectedCompany = INSURANCE_COMPANIES.find(c => c.id === data.companyId);
      if (!selectedCompany) {
        throw new Error('Invalid insurance company selected');
      }
      
      // Replace the UUID with the company code for the API
      const apiData = {
        ...data,
        companyId: selectedCompany.code // Send the code instead of UUID
      };
      
      await onSubmit(apiData);
      toast.success('Form data saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save form data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Insurance Company */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Insurance Company</h3>
        <Select
          label="Select Company"
          options={INSURANCE_COMPANIES.map(c => ({ value: c.id, label: c.name }))}
          error={errors.companyId?.message}
          {...register('companyId')}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Select the insurance company from the list
        </p>
      </div>

      {/* Rest of the form remains the same */}
      {/* Patient Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            error={errors.patientName?.message}
            {...register('patientName')}
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            error={errors.patientDob?.message}
            {...register('patientDob')}
            required
          />
          <Select
            label="Gender"
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
            error={errors.patientGender?.message}
            {...register('patientGender')}
            required
          />
          <Input
            label="Contact Number"
            type="tel"
            placeholder="+91 9876543210"
            error={errors.patientPhone?.message}
            {...register('patientPhone')}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="patient@example.com"
            error={errors.patientEmail?.message}
            {...register('patientEmail')}
          />
          <Input
            label="Policy Number"
            error={errors.policyNumber?.message}
            {...register('policyNumber')}
            required
          />
          <Input
            label="Address"
            className="md:col-span-2"
            error={errors.patientAddress?.message}
            {...register('patientAddress')}
          />
        </div>
      </div>

      {/* Admission Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Admission Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Admission Date"
            type="date"
            error={errors.admissionDate?.message}
            {...register('admissionDate')}
            required
          />
          <Input
            label="Discharge Date"
            type="date"
            error={errors.dischargeDate?.message}
            {...register('dischargeDate')}
          />
          <Select
            label="Admission Type"
            options={[
              { value: 'planned', label: 'Planned' },
              { value: 'emergency', label: 'Emergency' }
            ]}
            error={errors.admissionType?.message}
            {...register('admissionType')}
            required
          />
          {admissionDate && dischargeDate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Length of Stay: <span className="font-semibold">{calculateLengthOfStay()} days</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hospital Staff Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Hospital Staff Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Staff Name"
            error={errors.staffName?.message}
            {...register('staffName')}
            required
          />
          <Input
            label="Designation"
            placeholder="e.g., Nurse, Admin"
            error={errors.staffDesignation?.message}
            {...register('staffDesignation')}
            required
          />
          <Input
            label="Contact Number"
            type="tel"
            placeholder="+91 9876543210"
            error={errors.staffPhone?.message}
            {...register('staffPhone')}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="staff@hospital.com"
            error={errors.staffEmail?.message}
            {...register('staffEmail')}
            required
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save & Continue
        </Button>
      </div>
    </form>
  );
}