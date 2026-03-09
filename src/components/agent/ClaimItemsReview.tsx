'use client';

import { useState } from 'react';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency } from '@/lib/utils/formatters';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ClaimItem {
  id: string;
  category: string;
  subcategory: string;
  field_name: string;
  requested_amount: number;
  approved_amount?: number;
  rejected_amount?: number;
  rejection_reason?: string;
  status: string;
}

interface ClaimItemsReviewProps {
  items: ClaimItem[];
  onItemsChange: (items: ClaimItem[]) => void;
  readOnly?: boolean; // Add this prop
}

export default function ClaimItemsReview({ items, onItemsChange, readOnly = false }: ClaimItemsReviewProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleReason = (itemId: string) => {
    if (readOnly) return; // Don't expand reasons in read-only mode
    setExpandedReasons(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const updateItem = (itemId: string, updates: Partial<ClaimItem>) => {
    if (readOnly) return; // Don't allow updates in read-only mode
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    onItemsChange(updatedItems);
  };

  const handleApprovalChange = (itemId: string, approvedAmount: number) => {
    if (readOnly) return; // Don't allow changes in read-only mode
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const requestedAmount = item.requested_amount;
    const rejectedAmount = requestedAmount - approvedAmount;

    let status = 'approved';
    if (approvedAmount === 0) {
      status = 'rejected';
    } else if (approvedAmount < requestedAmount) {
      status = 'partial';
    }

    updateItem(itemId, {
      approved_amount: approvedAmount,
      rejected_amount: rejectedAmount,
      status
    });
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ClaimItem[]>);

  // Calculate totals
  const totals = {
    requested: items.reduce((sum, item) => sum + item.requested_amount, 0),
    approved: items.reduce((sum, item) => sum + (item.approved_amount || 0), 0),
    rejected: items.reduce((sum, item) => sum + (item.rejected_amount || 0), 0)
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">Total Requested</p>
          <p className="text-lg font-bold text-blue-700">{formatCurrency(totals.requested)}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-green-600 font-medium">Total Approved</p>
          <p className="text-lg font-bold text-green-700">{formatCurrency(totals.approved)}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-xs text-red-600 font-medium">Total Rejected</p>
          <p className="text-lg font-bold text-red-700">{formatCurrency(totals.rejected)}</p>
        </div>
      </div>

      {Object.entries(groupedItems).map(([category, categoryItems]) => {
        const isExpanded = expandedCategories.includes(category);
        const categoryTotal = categoryItems.reduce((sum, item) => sum + item.requested_amount, 0);

        return (
          <div key={category} className="border rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition"
              disabled={readOnly}
            >
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-900">{category}</span>
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
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Requested</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Approved</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Rejected</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reason</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{item.subcategory}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          {formatCurrency(item.requested_amount)}
                        </td>
                        <td className="px-4 py-2">
                          {readOnly ? (
                            <span className="text-sm text-green-600 font-medium">
                              {formatCurrency(item.approved_amount || 0)}
                            </span>
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              max={item.requested_amount}
                              step="0.01"
                              value={item.approved_amount || 0}
                              onChange={(e) => handleApprovalChange(item.id, parseFloat(e.target.value) || 0)}
                              className="w-24 text-right"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-red-600">
                          {formatCurrency(item.rejected_amount || 0)}
                        </td>
                        <td className="px-4 py-2">
                          {readOnly ? (
                            <span className="text-sm text-gray-600">
                              {item.rejection_reason || '-'}
                            </span>
                          ) : expandedReasons[item.id] ? (
                            <Textarea
                              value={item.rejection_reason || ''}
                              onChange={(e) => updateItem(item.id, { rejection_reason: e.target.value })}
                              placeholder="Enter rejection reason"
                              rows={2}
                              className="text-sm w-48"
                            />
                          ) : (
                            <button
                              onClick={() => toggleReason(item.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              + Add reason
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge status={item.status} />
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

      {readOnly && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ This claim is in read-only mode. No further edits can be made.
          </p>
        </div>
      )}
    </div>
  );
}