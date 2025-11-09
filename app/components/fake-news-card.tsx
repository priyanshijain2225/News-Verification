import type { ReactNode } from "react"
import { Card } from "@/app/components/ui/card"

interface FakeNewsCardProps {
  icon: ReactNode
  title: string
  description: string
  number?: number
  color?: string
}

export function FakeNewsCard({ icon, title, description, number, color = "bg-blue-50" }: FakeNewsCardProps) {
  return (
    <Card className={`${color} p-6 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {number && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
              {number}
            </div>
          )}
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-foreground/80">{description}</p>
        </div>
      </div>
    </Card>
  )
}
