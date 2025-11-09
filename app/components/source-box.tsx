import { Globe } from "lucide-react";

interface SourceBoxProps {
  name: string;
  date: string;
  description: string;
}

export function SourceBox({ name, date, description }: SourceBoxProps) {
  return (
    <div className="border-2 border-black rounded-xl p-3 lg:p-4 flex gap-3 bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 min-h-[100px] lg:min-h-[110px] w-full max-w-sm mx-auto">
      <Globe className="w-5 h-5 lg:w-6 lg:h-6 text-black shrink-0 mt-1" />
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <p className="font-semibold text-sm text-black truncate">{name}</p>
        <p className="text-xs text-gray-600">{date}</p>
        <p className="text-xs text-gray-700 mt-1 line-clamp-2 leading-tight">{description}</p>
      </div>
    </div>
  );
}
