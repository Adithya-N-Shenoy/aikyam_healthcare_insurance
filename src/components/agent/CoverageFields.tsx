'use client';

import { useState } from 'react';
import { MEDICAL_FIELDS } from '@/lib/constants/medicalFields';
import Select from '@/components/common/Select';
import Input from '@/components/common/Input';
import { CoverageRule } from '@/types/policy';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CoverageFieldsProps {
  coverage: Record<string, CoverageRule>;
  onChange: (field: string, rule: CoverageRule) => void;
}

export default function CoverageFields({ coverage, onChange }: CoverageFieldsProps) {
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

  const getCoverageTypeLabel = (type: string) => {
    switch (type) {
      case 'full': return 'Full Coverage';
      case 'limit': return 'Limit (Fixed Amount)';
      case 'percentage': return 'Percentage';
      case 'none': return 'Not Covered';
      default: return 'Select Type';
    }
  };

  const updateCoverageRule = (field: string, type: CoverageRule['type'], value?: number) => {
    onChange(field, { type, value: value || 0 });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Coverage Rules</h2>
      <p className="text-sm text-gray-600 mb-4">
        Define how each medical expense should be covered under this policy
      </p>

      <div className="space-y-4">
        {MEDICAL_FIELDS.map((category) => {
          const isExpanded = expandedCategories.includes(category.category);

          return (
            <div key={category.category} className="border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(category.category)}
                className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition"
              >
                <span className="font-semibold text-gray-900">{category.category}</span>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="p-4 space-y-4">
                  {category.subcategories.map((sub) => {
                    const currentRule = coverage[sub.field] || { type: 'none', value: 0 };

                    return (
                      <div key={sub.field} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <label className="text-sm font-medium text-gray-700 pt-2">
                          {sub.name}
                        </label>
                        
                        <Select
                          value={currentRule.type}
                          onChange={(e) => updateCoverageRule(
                            sub.field, 
                            e.target.value as CoverageRule['type']
                          )}
                          options={[
                            { value: 'full', label: 'Full Coverage' },
                            { value: 'limit', label: 'Limit (Fixed Amount)' },
                            { value: 'percentage', label: 'Percentage' },
                            { value: 'none', label: 'Not Covered' }
                          ]}
                        />

                        {currentRule.type !== 'none' && currentRule.type !== 'full' && (
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">
                              {currentRule.type === 'limit' ? '₹' : '%'}
                            </span>
                            <Input
                              type="number"
                              min="0"
                              step={currentRule.type === 'percentage' ? '1' : '100'}
                              value={currentRule.value}
                              onChange={(e) => updateCoverageRule(
                                sub.field,
                                currentRule.type,
                                parseFloat(e.target.value) || 0
                              )}
                              className="pl-8"
                              placeholder={currentRule.type === 'limit' ? 'Enter amount' : 'Enter percentage'}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}