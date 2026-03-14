'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    address: '',
    preExistingConditions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate date of birth is not in the future
    const selectedDate = new Date(formData.dob);
    const today = new Date();
    if (selectedDate > today) {
      toast.error('Date of birth cannot be in the future');
      setLoading(false);
      return;
    }

    // Convert comma-separated string to array
    const preExistingConditionsArray = formData.preExistingConditions
      ? formData.preExistingConditions.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      const result = await register(
        formData.email,
        formData.password,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'patient',
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          preExistingConditions: preExistingConditionsArray // Correct field name
        }
      );

      if (result.success) {
        toast.success('Registration successful! Please check your email for verification.', {
          duration: 6000
        });
        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        // Handle specific Firebase errors
        const errorMessage = result.error || 'Registration failed';
        
        if (errorMessage.includes('email-already-in-use')) {
          toast.error('This email is already registered. Please login instead.');
        } else if (errorMessage.includes('invalid-email')) {
          toast.error('Please enter a valid email address.');
        } else if (errorMessage.includes('weak-password')) {
          toast.error('Password is too weak. Please use a stronger password.');
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/register" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to registration options
        </Link>

        <Card className="shadow-xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
            <p className="text-gray-600 mt-2">Create your patient account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
              
              <Select
                label="Gender"
                name="gender"
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' }
                ]}
                value={formData.gender}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  name="address"
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label="Pre-existing Conditions (comma separated)"
                  name="preExistingConditions"
                  placeholder="e.g., diabetes, hypertension, asthma"
                  value={formData.preExistingConditions}
                  onChange={handleInputChange}
                  helperText="Enter conditions separated by commas (optional)"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">By registering, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-600">
                <li>Receive email notifications about your claims</li>
                <li>Allow authorized healthcare providers to submit claims on your behalf</li>
                <li>Verify your identity when required</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              loading={loading} 
              fullWidth
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Creating Account...' : 'Register as Patient'}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                Login here
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}