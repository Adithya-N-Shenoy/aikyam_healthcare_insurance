'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
}

export default function AgentRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyId: '',
    companyName: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

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

    // Get selected company name
    const selectedCompany = companies.find(c => c.id === formData.companyId);

    try {
      const result = await register(
        formData.email,
        formData.password,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'agent',
          companyId: formData.companyId,
          companyName: selectedCompany?.name || formData.companyName
        }
      );

      if (result.success) {
        toast.success('Registration successful! Please check your email for verification.');
        router.push('/login');
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
      console.error('Agent registration error:', error);
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
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
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Registration</h1>
            <p className="text-gray-600 mt-2">Register as an insurance agent</p>
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
                placeholder="agent@example.com"
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
              
              <Select
                label="Insurance Company"
                name="companyId"
                options={[
                  { value: '', label: 'Select Company' },
                  ...companies.map(company => ({
                    value: company.id,
                    label: company.name
                  }))
                ]}
                value={formData.companyId}
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
            </div>

            <Button 
              type="submit" 
              loading={loading} 
              fullWidth
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Creating Account...' : 'Register as Agent'}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an agent account?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Login here
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}