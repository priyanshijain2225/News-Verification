interface ConfidenceScoreBoxProps {
  score: number;
  sourceName: string;
}

export function ConfidenceScoreBox({ score, sourceName }: ConfidenceScoreBoxProps) {
  // text color for score number
  const getTextColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm hover:shadow-md transition-shadow duration-300`}
    >
      <p className="text-xs font-semibold text-gray-600 mb-1">{sourceName}</p>
      <p className={`text-lg font-bold ${getTextColor(score)}`}>{score}%</p>
    </div>
  );
}
