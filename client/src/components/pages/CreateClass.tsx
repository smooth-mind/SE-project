import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { createClass } from "@/api/class";

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  subject: z.string().min(1, "Subject is required"),
});

export type ClassPayload = z.infer<typeof classSchema>;

export default function CreateClassPage() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      section: "",
      subject: "",
    },
  });

  async function onSubmit(values: z.infer<typeof classSchema>) {
    const result = await createClass(values);
    if (result.ok) {
      toast.success("Class created successfully!");
      navigate("/");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50/30 to-white dark:from-gray-900 dark:to-blue-950/30">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Create New Class
            </h1>
            <p className="text-muted-foreground">
              Set up a new class to start managing assignments and students
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-xl text-center">
              Class Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        Class Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Advanced Mathematics"
                          className="h-12 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          Section
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., A, B, Morning"
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
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-600" />
                          Subject
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Calculus, Chemistry"
                            className="h-12 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Creating Class..."
                      : "Create Class"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="text-center p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-sm">Manage Assignments</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Create and track student assignments
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-green-50/50 dark:bg-green-900/20">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium text-sm">Student Enrollment</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Share invite codes for easy joining
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
            <GraduationCap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium text-sm">Grade Management</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Track progress and provide feedback
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
