import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getClass } from "@/api/class";
import { toast } from "sonner";
import type { ClassDetails, Assignment } from "@/types";
import { useAuth } from "@/lib/AuthContext";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
} from "lucide-react";

export default function ClassDetailPage() {
  const { classId } = useParams();
  const [classDetails, setClassData] = useState<ClassDetails | null>(null);

  const { auth } = useAuth();
  const navigate = useNavigate();

  const copyInviteCode = async () => {
    if (classDetails?.invite_code) {
      try {
        await navigator.clipboard.writeText(classDetails.invite_code);
        toast.success("Invite code copied to clipboard!");
      } catch {
        toast.error("Failed to copy invite code");
      }
    }
  };

  useEffect(() => {
    if (!classId || !Number(classId)) return;
    getClass(Number(classId)).then((result) => {
      if (result.ok) setClassData(result.value);
      else toast.error("Unable to load class!");
    });
  }, [classId]);

  const getAssignmentStatus = (assignment: Assignment) => {
    if (auth.role === "teacher") {
      return {
        label: `${assignment.submission_count} submitted`,
        variant: "secondary" as const,
        icon: <Users className="h-3 w-3" />,
      };
    }

    if (assignment.submitted) {
      return {
        label: "Submitted",
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
      };
    }

    if (new Date(assignment.deadline) < new Date()) {
      return {
        label: "Missed",
        variant: "destructive" as const,
        icon: <XCircle className="h-3 w-3" />,
      };
    }

    return {
      label: "Pending",
      variant: "outline" as const,
      icon: <AlertCircle className="h-3 w-3" />,
    };
  };

  if (!classDetails)
    return (
      <div className="w-full h-full min-h-full min-w-full grid place-items-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading class details...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50/30 to-white dark:from-gray-900 dark:to-blue-950/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with back button */}
        <div className="space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Class Header Card */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
            <CardHeader className="pb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                    {classDetails.name}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {classDetails.subject} • Section {classDetails.section}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="flex items-center gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-800/30 transition-colors group"
                onClick={copyInviteCode}
                title="Click to copy invite code"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Invite Code
                  </p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300 font-mono">
                    {classDetails.invite_code}
                  </p>
                </div>
                <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Students
                  </p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {classDetails.student_count} enrolled
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    Teacher
                  </p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {classDetails.teacher.name ||
                      classDetails.teacher.username ||
                      classDetails.teacher.email ||
                      "N/A"}
                  </p>
                  {classDetails.teacher.name && (
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {classDetails.teacher.email}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              Assignments
            </h2>
            {auth.role == "teacher" && (
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
              >
                <Link
                  to={`/classes/${classId}/assignments/create/`}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </Link>
              </Button>
            )}
          </div>

          {classDetails.assignments.length === 0 ? (
            <Card className="shadow-lg border-dashed border-2 bg-white/50 dark:bg-gray-900/50">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No assignments yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {auth.role === "teacher"
                    ? "Create your first assignment to get started with this class."
                    : "Your teacher hasn't created any assignments yet. Check back later!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classDetails.assignments.map((a) => {
                const status = getAssignmentStatus(a);
                const isOverdue = new Date(a.deadline) < new Date();

                return (
                  <Card
                    key={a.id}
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-0 shadow-lg hover:scale-[1.02]"
                    onClick={() =>
                      navigate(`/classes/${classId}/assignments/${a.id}/`)
                    }
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                            {a.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <CardDescription
                              className={`text-sm ${
                                isOverdue
                                  ? "text-red-600 dark:text-red-400"
                                  : ""
                              }`}
                            >
                              {format(new Date(a.deadline), "PPP")}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <CardDescription
                              className={`text-sm ${
                                isOverdue
                                  ? "text-red-600 dark:text-red-400"
                                  : ""
                              }`}
                            >
                              {format(new Date(a.deadline), "p")}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={status.variant}
                          className="flex items-center gap-1 ml-2"
                        >
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      {a.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                          {a.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 hover:border-blue-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={a.task_file}
                              target="_blank"
                              className="flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              Task
                            </a>
                          </Button>
                          {auth.role === "teacher" && !!a.solution_file && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="hover:bg-purple-50 hover:border-purple-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a
                                href={a.solution_file}
                                target="_blank"
                                className="flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" />
                                Solution
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
