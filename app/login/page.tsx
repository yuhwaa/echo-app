"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">Echo</h1>
        <p className="text-slate-500 text-sm mb-6">Sign in to continue</p>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <button
          onClick={() => router.push("/")}
          className="text-xs text-slate-400 hover:text-emerald-600 transition-colors mb-4 items-center gap-1 w-full text-center"
        >
          ← Back to Dashboard
        </button>
        </div>
      </div>
    </div>
  )
}