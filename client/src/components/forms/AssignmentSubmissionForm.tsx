import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { submitAssignment } from "@/api/assignments";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

const assignmentSchema = z.object({
  submitted_files: z
    .any()
    .refine(
      (submitted_files) => submitted_files?.length > 0,
      "At least one file is required."
    ),
  isHandWritten: z.boolean(),
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

type Props = {
  id: number;
  classId: number;
  onSubmitSuccess?: () => void;
};

export default function AssignmentSubmissionForm({
  id,
  onSubmitSuccess,
}: Props) {
  const [filePreviews, setFilePreviews] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      submitted_files: undefined,
      isHandWritten: false,
    },
  });

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const onSubmit = async (values: AssignmentFormValues) => {
    setIsSubmitting(true);
    const formData = new FormData();

    if (values.submitted_files.length > 0)
      formData.append("submitted_file", values.submitted_files[0]);

    formData.append("is_hand_written", values.isHandWritten.toString());

    try {
      const result = await submitAssignment(id, formData);
      if (result.ok) {
        form.reset();
        setFilePreviews([]);
        toast.success("Assignment submitted successfully!");
        onSubmitSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch (error: unknown) {
      console.error("Assignment submission error:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
            <Upload className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Submit Your Solution
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your assignment solution below
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="submitted_files"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-semibold">
                  <FileText className="h-4 w-4 text-green-600" />
                  Solution File
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.md,.zip,.py,.js,.html,.css,.java,.cpp,.c,.png,.jpg,.jpeg"
                        className="h-14 bg-white/70 dark:bg-gray-800/70 border-2 border-dashed border-green-300 dark:border-green-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:h-10"
                        onChange={(e) => {
                          const submitted_files = e.target.files;
                          field.onChange(submitted_files);
                          setFilePreviews(
                            submitted_files ? Array.from(submitted_files) : []
                          );
                        }}
                        disabled={isSubmitting}
                      />
                    </div>

                    {filePreviews.length > 0 && (
                      <div className="space-y-3">
                        {filePreviews.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                          >
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-800 dark:text-green-300 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Upload your solution file. Supported formats: PDF, Word
                  documents, code files, or ZIP archives.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isHandWritten"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start space-x-3 space-y-0 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      Hand-written Solution
                    </FormLabel>
                    <FormDescription className="text-xs text-gray-600 dark:text-gray-400">
                      Check this box if your solution is hand-written and
                      scanned/photographed
                    </FormDescription>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={isSubmitting || filePreviews.length === 0}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Submit Assignment
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
