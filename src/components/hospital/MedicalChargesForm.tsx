'use client';

import { useState } from 'react';
import { MEDICAL_FIELDS } from '@/lib/constants/medicalFields';
import Input from '@/components/common/Input';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MedicalChargeItem } from '@/types/claim';

interface MedicalChargesFormProps {
  charges: MedicalChargeItem[];
  onChange: (charges: MedicalChargeItem[]) => void;
}

export default function MedicalChargesForm({ charges, onChange }: MedicalChargesFormProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    MEDICAL_FIELDS.map(c => c.category)
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const updateCharge = (fieldName: string, amount: number) => {
    const updatedCharges = charges.map(charge =>
      charge.fieldName === fieldName
        ? { ...charge, requestedAmount: amount }
        : charge
    );
    onChange(updatedCharges);
  };

  const getCategoryTotal = (category: string) => {
    return charges
      .filter(c => c.category === category)
      .reduce((sum, c) => sum + (c.requestedAmount || 0), 0);
  };

  const totalAmount = charges.reduce((sum, c) => sum + (c.requestedAmount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Total Summary */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-blue-900">Total Claim Amount:</span>
          <span className="text-2xl font-bold text-blue-600">
            ₹{totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Medical Fields by Category */}
      {MEDICAL_FIELDS.map((category) => {
        const isExpanded = expandedCategories.includes(category.category);
        const categoryTotal = getCategoryTotal(category.category);
        const categoryCharges = charges.filter(c => c.category === category.category);

        return (
          <div key={category.category} className="border rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              type="button"
              onClick={() => toggleCategory(category.category)}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition"
            >
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-900">{category.category}</span>
                <span className="text-sm text-gray-600">
                  Total: ₹{categoryTotal.toLocaleString()}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {/* Category Items */}
            {isExpanded && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.subcategories.map((sub) => {
                    const charge = categoryCharges.find(c => c.fieldName === sub.field);
                    return (
                      <div key={sub.field} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {sub.name}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">₹</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={charge?.requestedAmount || 0}
                            onChange={(e) => updateCharge(sub.field, parseFloat(e.target.value) || 0)}
                            className="pl-8"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Instructions */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">Note:</span> You can edit any amount manually. 
          The total claim amount will be calculated automatically.
        </p>
      </div>
    </div>
  );
}