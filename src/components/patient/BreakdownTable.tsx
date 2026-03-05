'use client';

import { useState } from 'react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency } from '@/lib/utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BreakdownItem {
  id: string;
  category: string;
  subcategory: string;
  requested_amount: number;
  approved_amount: number;
  rejected_amount: number;
  status: string;
  rejection_reason?: string;
}

interface BreakdownTableProps {
  items: BreakdownItem[];
}

export default function BreakdownTable({ items }: BreakdownTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, BreakdownItem[]>);

  const totals = {
    requested: items.reduce((sum, item) => sum + item.requested_amount, 0),
    approved: items.reduce((sum, item) => sum + (item.approved_amount || 0), 0),
    rejected: items.reduce((sum, item) => sum + (item.rejected_amount || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Requested Amount</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(totals.requested)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Approved Amount</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totals.approved)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Rejected Amount</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.rejected)}</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Complete Transparent Breakdown</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            const isExpanded = expandedCategories.includes(category);
            const categoryTotal = categoryItems.reduce((sum, item) => sum + item.requested_amount, 0);

            return (
              <div key={category}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900">{category}</span>
                    <span className="text-sm text-gray-600">
                      Total: {formatCurrency(categoryTotal)}
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
                  <div className="px-6 pb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Requested</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Approved</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Rejected</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {categoryItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.subcategory}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">
                              {formatCurrency(item.requested_amount)}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-green-600">
                              {formatCurrency(item.approved_amount || 0)}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-red-600">
                              {formatCurrency(item.rejected_amount || 0)}
                            </td>
                            <td className="px-4 py-2">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {item.rejection_reason || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">TOTAL</span>
            <div className="flex space-x-8">
              <span className="text-lg font-bold text-blue-600">{formatCurrency(totals.requested)}</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(totals.approved)}</span>
              <span className="text-lg font-bold text-red-600">{formatCurrency(totals.rejected)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}