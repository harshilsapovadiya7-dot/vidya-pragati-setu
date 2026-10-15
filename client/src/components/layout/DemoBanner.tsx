import { AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">DEMONSTRATION MODE</span>
        <span className="hidden sm:inline">— Sample data for evaluation purposes. Not connected to live government systems.</span>
      </div>
    </div>
  );
}
