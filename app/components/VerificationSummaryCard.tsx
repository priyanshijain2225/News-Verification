import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, ExternalLink } from 'lucide-react';

interface VerificationSummaryProps {
  truthScore: number;
  isLikelyMisinformation: boolean;
  reasons: string[];
  verificationSummary: string;
  supportingArticles: number;
  contradictingArticles: number;
  sources: Array<{
    name: string;
    url?: string;
    reliability: number;
    stance: 'supports' | 'contradicts' | 'neutral';
  }>;
}

export function VerificationSummaryCard({
  truthScore,
  isLikelyMisinformation,
  reasons,
  verificationSummary,
  supportingArticles,
  contradictingArticles,
  sources
}: VerificationSummaryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getVerificationIcon = () => {
    if (truthScore >= 80) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (truthScore >= 60) return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    return <XCircle className="w-6 h-6 text-red-600" />;
  };

  const getStanceIcon = (stance: string) => {
    switch (stance) {
      case 'supports':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'contradicts':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStanceColor = (stance: string) => {
    switch (stance) {
      case 'supports':
        return 'text-green-700 bg-green-50';
      case 'contradicts':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Verification Score */}
      <div className={`border-2 rounded-2xl p-4 lg:p-6 ${getScoreBgColor(truthScore)}`}>
        <div className="flex items-center gap-3 lg:gap-4 mb-4">
          {getVerificationIcon()}
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900">Truth Score</h3>
            <p className={`text-2xl lg:text-3xl font-extrabold ${getScoreColor(truthScore)}`}>
              {truthScore}%
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
            {verificationSummary}
          </p>
        </div>

        {/* Article Statistics */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4 text-center">
          <div className="bg-white/60 rounded-lg p-2 lg:p-3">
            <div className="text-xl lg:text-2xl font-bold text-green-600">{supportingArticles}</div>
            <div className="text-xs text-gray-600">Supporting</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2 lg:p-3">
            <div className="text-xl lg:text-2xl font-bold text-red-600">{contradictingArticles}</div>
            <div className="text-xs text-gray-600">Contradicting</div>
          </div>
        </div>
      </div>

      {/* Analysis Findings */}
      {reasons && reasons.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Analysis Findings</h4>
          <div className="space-y-3">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-start gap-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 shrink-0"></div>
                <p className="text-base text-gray-700 leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source Stance Analysis */}
      {sources && sources.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Source Analysis</h4>
          <div className="space-y-3">
            {sources.map((source, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStanceIcon(source.stance)}
                    <span className="text-base font-semibold text-gray-900">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Reliability: <span className="font-semibold">{source.reliability}%</span>
                    </span>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStanceColor(source.stance)}`}>
                  {source.stance === 'supports' ? 'Supports Claims' :
                   source.stance === 'contradicts' ? 'Contradicts Claims' :
                   'Neutral Position'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {isLikelyMisinformation && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
            <h4 className="text-lg font-semibold text-red-800">Misinformation Risk Detected</h4>
          </div>
          <p className="text-red-700 text-sm">
            Our analysis suggests this content may contain misinformation. Please verify independently 
            and be cautious about sharing this content.
          </p>
        </div>
      )}
    </div>
  );
}

export default VerificationSummaryCard;
