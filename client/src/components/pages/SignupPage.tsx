import { Link } from "react-router-dom";
import SignupForm from "@/components/forms/SignupForm";
import { GraduationCap, Users, BookOpen, Award } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-blue-950 flex">
      {/* Left side - Signup Form */}
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
                Create your account
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Join thousands of educators and students
              </p>
            </div>

            <div className="space-y-6">
              <SignupForm />

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold leading-tight">
                Join the future of education
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Whether you're a teacher or student, ClassManager provides all
                the tools you need for modern, efficient classroom management.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    For Teachers
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Create classes, assign homework, and track student progress
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    For Students
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Join classes, submit assignments, and stay organized
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Track Progress
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Monitor performance and achievements in real-time
                  </p>
                </div>
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
