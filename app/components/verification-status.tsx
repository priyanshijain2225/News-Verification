import { Check, X, AlertTriangle, Shield } from "lucide-react"

interface VerificationStatusProps {
  isVerified: boolean;
  truthScore?: number;
}

export function VerificationStatus({ isVerified, truthScore }: VerificationStatusProps) {
  const getStatusInfo = () => {
    if (!truthScore) {
      return {
        icon: isVerified ? Check : X,
        text: isVerified ? "Verified" : "Not Verified",
        color: isVerified ? "text-green-600" : "text-red-600",
        bgColor: isVerified ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      };
    }

    if (truthScore >= 80) {
      return {
        icon: Shield,
        text: "Highly Verified",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        score: truthScore
      };
    } else if (truthScore >= 70) {
      return {
        icon: Check,
        text: "Mostly Verified",
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
        score: truthScore
      };
    } else if (truthScore >= 60) {
      return {
        icon: AlertTriangle,
        text: "Questionable",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200",
        score: truthScore
      };
    } else if (truthScore >= 50) {
      return {
        icon: AlertTriangle,
        text: "Likely False",
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
        score: truthScore
      };
    } else {
      return {
        icon: X,
        text: "Misinformation Risk",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        score: truthScore
      };
    }
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  return (
    <div className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3 w-full ${statusInfo.bgColor}`}>
      <IconComponent className={`w-8 h-8 ${statusInfo.color} shrink-0`} strokeWidth={2.5} />
      <div className="flex-1">
        <div className="font-bold text-foreground">{statusInfo.text}</div>
        {statusInfo.score !== undefined && (
          <div className="text-sm text-muted-foreground">
            Truth Score: <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.score}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
