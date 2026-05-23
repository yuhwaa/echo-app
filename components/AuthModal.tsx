import { useRouter } from "next/navigation";
import { X } from "lucide-react";

type AuthModalProps = {
  action: string;
  onClose: () => void;
};

export default function AuthModal({ action, onClose }: AuthModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 w-full max-w-sm mx-4">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
            Sign in required
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Please log in to {action}.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/login")}
            className="flex-1 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}