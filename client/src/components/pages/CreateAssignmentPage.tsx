import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useParams, Link } from "react-router";
import { createAssignment } from "@/api/assignments";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Calendar,
  ArrowLeft,
  CheckCircle,
  LetterText,
  Sigma,
} from "lucide-react";

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  max_score: z.number().min(0),
  description: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  taskFile: z
    .any()
    .refine((file) => file?.length === 1, "Task document is required"),
  solutionFile: z
    .any()
    .refine((file) => file?.length === 1, "Solution file is required"),
});

export default function CreateAssignmentPage() {
  const { classId } = useParams();

  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      max_score: 0,
      description: "",
      deadline: "",
      taskFile: undefined,
      solutionFile: undefined,
    },
  });

  const [taskPreview, setTaskPreview] = useState<File | null>(null);
  const [solutionPreview, setSolutionPreview] = useState<File | null>(null);

  function onSubmit(values: z.infer<typeof assignmentSchema>) {
    if (!classId) return;
    const formData = new FormData();
    formData.append("name", values.title);
    formData.append("max_score", String(values.max_score));
    formData.append("description", values.description || "");
    formData.append("deadline", values.deadline);
    formData.append("task_file", values.taskFile[0]);
    formData.append("solution_file", values.solutionFile[0]);
    formData.append("classroom", classId);
    createAssignment(formData).then((result) => {
      if (result.ok) {
        toast.success("Assignment created successfully!");
        window.history.back();
      } else {
        toast.error(result.error);
      }
    });
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50/30 to-white dark:from-gray-900 dark:to-blue-950/30">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
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
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Create Assignment
            </h1>
            <p className="text-muted-foreground">
              Create a new assignment with tasks and solutions for your students
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-xl text-center">
              Assignment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                    Basic Information
                  </h3>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          Assignment Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Data Structures Quiz 1"
                            className="h-12 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Sigma className="h-4 w-4 text-blue-600" />
                          Max Score
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            className="h-12 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <LetterText className="h-4 w-4 text-blue-600" />
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide instructions, grading criteria, or additional details for students..."
                            className="min-h-[100px] bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Add any special instructions or requirements
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          Deadline
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="h-12 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Students won't be able to submit after this deadline
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* File Uploads */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-2">
                    File Attachments
                  </h3>

                  <FormField
                    control={form.control}
                    name="taskFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-blue-600" />
                          Task Document
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.md"
                              className="h-12 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                field.onChange(e.target.files);
                                setTaskPreview(file || null);
                              }}
                            />
                            {taskPreview && (
                              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                    {taskPreview.name}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {formatFileSize(taskPreview.size)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload the assignment task file (PDF, Word, or text
                          document)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="solutionFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-blue-600" />
                          Solution File
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.md,.zip"
                              className="h-12 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                field.onChange(e.target.files);
                                setSolutionPreview(file || null);
                              }}
                            />
                            {solutionPreview && (
                              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <CheckCircle className="h-5 w-5 text-purple-600" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                                    {solutionPreview.name}
                                  </p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400">
                                    {formatFileSize(solutionPreview.size)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Upload the solution file (only visible to teachers)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Creating Assignment..."
                      : "Create Assignment"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
