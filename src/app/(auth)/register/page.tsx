'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/common/Card';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Choose your account type to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Agent Card */}
          <div
            onClick={() => router.push('/register/agent')}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition"
          >
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👔</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Insurance Agent</h3>
            <p className="text-sm text-gray-600 mt-2">
              Register as an agent to create policies and review claims
            </p>
          </div>

          {/* Patient Card */}
          <div
            onClick={() => router.push('/register/patient')}
            className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition"
          >
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👤</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Patient</h3>
            <p className="text-sm text-gray-600 mt-2">
              Register as a patient to buy policies and track claims
            </p>
          </div>

          {/* Hospital Card */}
          <div
            onClick={() => router.push('/register/hospital')}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition"
          >
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🏥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Hospital Staff</h3>
            <p className="text-sm text-gray-600 mt-2">
              Register as hospital staff to submit claims for patients
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}