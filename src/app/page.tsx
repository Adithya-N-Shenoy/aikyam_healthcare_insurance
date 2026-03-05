import Link from 'next/link';
import { Shield, Zap, Camera, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            <span className="text-blue-600">Aikyam</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparent Healthcare Insurance Platform
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">
            Simplifying healthcare insurance claims with complete transparency for hospitals, agents, and patients.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Full Transparency</h3>
            <p className="text-gray-600">
              Complete visibility into claim amounts, approvals, and rejections
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
            <p className="text-gray-600">
              OCR-powered bill extraction for quick claim submission
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fraud Prevention</h3>
            <p className="text-gray-600">
              Room photo verification to prevent fraudulent claims
            </p>
          </div>
        </div>

        {/* Portal Access Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/hospital" className="block">
            <div className="bg-blue-600 text-white rounded-xl p-8 hover:bg-blue-700 transition cursor-pointer">
              <h3 className="text-2xl font-bold mb-2">Hospital</h3>
              <p className="text-blue-100 mb-4">
                Submit patient claims with bill upload and OCR processing
              </p>
              <span className="inline-flex items-center text-white">
                Access Portal →
              </span>
            </div>
          </Link>

          <Link href="/agent" className="block">
            <div className="bg-green-600 text-white rounded-xl p-8 hover:bg-green-700 transition cursor-pointer">
              <h3 className="text-2xl font-bold mb-2">Insurance Agent</h3>
              <p className="text-green-100 mb-4">
                Review and approve claims with transparent breakdown
              </p>
              <span className="inline-flex items-center text-white">
                Access Portal →
              </span>
            </div>
          </Link>

          <Link href="/patient" className="block">
            <div className="bg-purple-600 text-white rounded-xl p-8 hover:bg-purple-700 transition cursor-pointer">
              <h3 className="text-2xl font-bold mb-2">Patient</h3>
              <p className="text-purple-100 mb-4">
                Track your claim status and view transparent breakdown
              </p>
              <span className="inline-flex items-center text-white">
                Access Portal →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}