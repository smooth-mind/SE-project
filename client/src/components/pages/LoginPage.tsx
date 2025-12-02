import { Link } from "react-router-dom";
import LoginForm from "@/components/forms/LoginForm";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-blue-950 flex">
      {/* Left side - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col">
        <div className="flex justify-center pt-8 lg:justify-start lg:pl-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              ClassManager
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome back
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </p>
            </div>

            <div className="space-y-6">
              <LoginForm />

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Illustration/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold leading-tight">
                Manage your classes with ease
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Create assignments, track submissions, and engage with your
                students all in one powerful platform designed for modern
                education.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">
                  Create and manage classes effortlessly
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">
                  Track student progress in real-time
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">
                  Streamlined assignment workflow
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>
    </div>
  );
}
