"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-orange-500 mb-8">
          Login to TruthLens
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <button
            type="submit"
            className="bg-orange-600 text-white font-semibold py-3 rounded-lg hover:bg-orange-700 transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>
            Don’t have an account?{" "}
            <Link href="#" className="text-orange-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              ← Back to Home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
