import React from 'react';
import { Claim } from '@/lib/geminiService';

interface ClaimsDisplayProps {
  claims: Claim[];
}

export function ClaimsDisplay({ claims }: ClaimsDisplayProps) {
  if (!claims || claims.length === 0) {
    return null;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'factual':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'statistic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'opinion':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'prediction':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {claims.map((claim, index) => (
        <div key={claim.id || index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          {/* Header with type and confidence */}
          <div className="flex justify-between items-start mb-3">
            <span className={`px-3 py-1 text-sm rounded-full font-medium border ${getTypeColor(claim.type)}`}>
              {claim.type.charAt(0).toUpperCase() + claim.type.slice(1)}
            </span>
            <div className="text-right">
              <div className="text-xs text-gray-500">Confidence</div>
              <div className={`text-sm font-semibold ${getConfidenceColor(claim.confidence)}`}>
                {claim.confidence}%
              </div>
            </div>
          </div>

          {/* Claim text */}
          <p className="text-sm text-gray-800 leading-relaxed mb-2">
            "{claim.text}"
          </p>

          {/* Context if available */}
          {claim.context && (
            <div className="bg-white border-l-3 border-l-orange-400 pl-3 py-2 mt-3 rounded">
              <p className="text-xs text-gray-600 italic">
                <span className="font-medium">Context:</span> {claim.context}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ClaimsDisplay;
