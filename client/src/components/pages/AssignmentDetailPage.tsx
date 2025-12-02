import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import type { Assignment } from "@/types";
import {
  autoCheckAssignment,
  getAssignment,
  getAssignmentSubmissions,
  resetSubmissionScores,
  markSubmission,
} from "@/api/assignments";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import AssignmentSubmissionForm from "../forms/AssignmentSubmissionForm";
import {
  FileText,
  Calendar,
  Clock,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  GraduationCap,
  Users,
  Eye,
  Award,
  File,
  Sigma,
} from "lucide-react";
import { format } from "date-fns";

type Submission = {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
  };
  submitted_file: string;
  submitted_file_url: string;
  submitted_at: string;
  score: number | null;
  is_hand_written: boolean;
};

export default function AssignmentDetailsPage() {
  const { assignmentId, classId } = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [scoringSubmissionId, setScoringSubmissionId] = useState<number | null>(
    null
  );
  const [scoreInputs, setScoreInputs] = useState<Record<number, string>>({});

  const { auth } = useAuth();

  useEffect(() => {
    getAssignment(Number(assignmentId || "-1"), Number(classId || "-1")).then(
      (result) => {
        if (result.ok) setAssignment(result.value);
        else toast.error("Unable to load assignment!");
      }
    );
  }, [assignmentId]);

  useEffect(() => {
    if (auth.role === "teacher" && assignmentId) {
      setLoadingSubmissions(true);
      getAssignmentSubmissions(Number(assignmentId)).then((result) => {
        if (result.ok) {
          setSubmissions(result.value);
        } else {
          toast.error("Unable to load submissions!");
        }
        setLoadingSubmissions(false);
      });
    }
  }, [assignmentId, auth.role]);

  function getFilenameFromUrl(url: string): string {
    return url.split("/").pop() ?? url;
  }

  const getAssignmentStatus = () => {
    if (!assignment) return null;

    if (auth.role === "teacher") {
      return {
        label: `${assignment.submission_count || 0} submissions`,
        variant: "secondary" as const,
        icon: <FileText className="h-3 w-3" />,
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

  const handleSubmissionSuccess = () => {
    // Refresh the assignment data after successful submission
    getAssignment(Number(assignmentId || "-1"), Number(classId || "-1")).then(
      (result) => {
        if (result.ok) {
          setAssignment(result.value);
        }
      }
    );
  };

  const handleDownloadSubmission = (fileUrl: string, studentName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${studentName}_submission_${getFilenameFromUrl(fileUrl)}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function handleAutoCheck() {
    autoCheckAssignment(
      Number(assignmentId || "-1"),
      Number(classId || "-1")
    ).then((result) => {
      if (result.ok) window.location.reload();
      else toast.error(result.error);
    });
  }

  function handleResetScores() {
    if (
      confirm(
        "Are you sure you want to reset all scores for this assignment? This action cannot be undone."
      )
    ) {
      resetSubmissionScores(Number(assignmentId || "-1")).then((result) => {
        if (result.ok) {
          toast.success(
            `Successfully reset scores for ${result.value.reset_count} submissions`
          );
          window.location.reload();
        } else {
          toast.error(result.error);
        }
      });
    }
  }

  function handleManualScore(submissionId: number) {
    const scoreStr = scoreInputs[submissionId];
    if (!scoreStr || scoreStr.trim() === "") {
      toast.error("Please enter a score");
      return;
    }

    const score = parseFloat(scoreStr);
    if (isNaN(score) || score < 0 || score > (assignment?.max_score || 100)) {
      toast.error(
        `Score must be between 0 and ${assignment?.max_score || 100}`
      );
      return;
    }

    setScoringSubmissionId(submissionId);
    markSubmission(submissionId, score).then((result) => {
      if (result.ok) {
        toast.success("Score updated successfully");
        // Update the submissions state with the new score
        setSubmissions((prev) =>
          prev.map((sub) => (sub.id === submissionId ? { ...sub, score } : sub))
        );
        // Clear the input
        setScoreInputs((prev) => ({ ...prev, [submissionId]: "" }));
      } else {
        toast.error(result.error);
      }
      setScoringSubmissionId(null);
    });
  }

  if (!assignment)
    return (
      <div className="grid place-items-center min-w-full min-h-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading assignment...</p>
        </div>
      </div>
    );

  const status = getAssignmentStatus();
  const isOverdue = new Date(assignment.deadline) < new Date();

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50/30 to-white dark:from-gray-900 dark:to-blue-950/30">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <Link
            to={`/classes/${classId}`}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Class
          </Link>

          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Assignment Details
            </h1>
          </div>
        </div>

        {/* Assignment Details Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {assignment.name}
                </CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span
                      className={
                        isOverdue
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : ""
                      }
                    >
                      Due: {format(new Date(assignment.deadline), "PPP")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span
                      className={
                        isOverdue
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : ""
                      }
                    >
                      {format(new Date(assignment.deadline), "p")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sigma className="h-4 w-4 text-blue-600" />
                    <span
                      className={
                        isOverdue
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : ""
                      }
                    >
                      {assignment.max_score}
                    </span>
                  </div>
                </div>
              </div>
              {status && (
                <Badge
                  variant={status.variant}
                  className="flex items-center gap-1 ml-4"
                >
                  {status.icon}
                  {status.label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {assignment.description && (
              <div>
                <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 block">
                  Description
                </Label>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {assignment.description}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Task File */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Task Document
                </Label>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-blue-900 dark:text-blue-100 truncate">
                          {getFilenameFromUrl(assignment.task_file)}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Assignment instructions
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-100 dark:hover:bg-blue-800 flex-shrink-0"
                    >
                      <a
                        href={assignment.task_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Solution File (Teacher Only) */}
              {auth.role === "teacher" && assignment.solution_file && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Solution File
                  </Label>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-purple-900 dark:text-purple-100 truncate">
                            {getFilenameFromUrl(assignment.solution_file)}
                          </p>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            Teacher's solution
                          </p>
                        </div>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="hover:bg-purple-100 dark:hover:bg-purple-800 flex-shrink-0"
                      >
                        <a
                          href={assignment.solution_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student's Own Submission (For Students) */}
        {auth.role === "student" && assignment.user_submission && (
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Your Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                        <File className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {getFilenameFromUrl(
                            assignment.user_submission.submitted_file
                          )}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Submitted on{" "}
                          {format(
                            new Date(assignment.user_submission.submitted_at),
                            "PPP 'at' p"
                          )}
                        </p>
                        {assignment.user_submission.is_hand_written && (
                          <Badge variant="outline" className="mt-1">
                            Hand-written
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="hover:bg-green-100 dark:hover:bg-green-800"
                    >
                      <a
                        href={assignment.user_submission.submitted_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>

                {assignment.user_submission.score !== null && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-900 dark:text-amber-100">
                          Score: {assignment.user_submission.score}
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          Graded by teacher
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teacher Submissions View */}
        {auth.role === "teacher" && (
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="flex gap-3 items-center">
                  <Users className="h-6 w-6 text-blue-600" />
                  Student Submissions ({submissions.length})
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {new Date(assignment.deadline) < new Date() && (
                    <Button
                      onClick={handleAutoCheck}
                      className="w-full sm:w-auto"
                    >
                      Auto Check
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleResetScores}
                    className="text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50 w-full sm:w-auto"
                  >
                    Reset Scores
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSubmissions ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading submissions...
                  </p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No submissions yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Students haven't submitted their assignments yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {submission.student.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) ||
                              submission.student.email
                                .split("@")[0]
                                .slice(0, 2)
                                .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {submission.student.name ||
                                submission.student.email}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Submitted on{" "}
                              {format(
                                new Date(submission.submitted_at),
                                "PPP 'at' p"
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {submission.is_hand_written && (
                                <Badge variant="outline" className="text-xs">
                                  Hand-written
                                </Badge>
                              )}
                              {submission.score !== null && (
                                <Badge variant="secondary" className="text-xs">
                                  Score: {submission.score}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions Section - Responsive */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                          {/* Manual Score Input */}
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Score"
                              min="0"
                              max={assignment?.max_score || 100}
                              step="0.25"
                              value={scoreInputs[submission.id] || ""}
                              onChange={(e) =>
                                setScoreInputs((prev) => ({
                                  ...prev,
                                  [submission.id]: e.target.value,
                                }))
                              }
                              className="w-16 h-8 text-sm flex-shrink-0"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleManualScore(submission.id)}
                              disabled={scoringSubmissionId === submission.id}
                              className="h-8 px-2 text-xs whitespace-nowrap flex-1 sm:flex-initial"
                            >
                              {scoringSubmissionId === submission.id
                                ? "Saving..."
                                : "Set Score"}
                            </Button>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDownloadSubmission(
                                submission.submitted_file_url,
                                submission.student.name ||
                                  submission.student.email
                              )
                            }
                            className="flex items-center justify-center gap-2 h-8 whitespace-nowrap w-full sm:w-auto"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sm:inline">Download</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submission Section */}
        {!assignment.submitted &&
          auth.role === "student" &&
          (isOverdue ? (
            <Card className="shadow-lg bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="py-8 text-center">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                  Submission Deadline Passed
                </h3>
                <p className="text-red-600 dark:text-red-400">
                  Unfortunately, the deadline for this assignment has passed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardContent className="pt-6">
                <AssignmentSubmissionForm
                  id={assignment.id}
                  classId={Number(classId ?? "-1")}
                  onSubmitSuccess={handleSubmissionSuccess}
                />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
