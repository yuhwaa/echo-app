export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">Echo</h1>
        <p className="text-slate-500 text-sm mb-6">Sign in to continue</p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
          <button className="w-full py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}