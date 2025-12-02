import { getClasses } from "@/api/class";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Class } from "@/types";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Users, BookOpen, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinClass } from "@/api/class";

const joinClassSchema = z.object({
  invite_code: z.string().length(7),
});
type JoinClassFormValues = z.infer<typeof joinClassSchema>;

function JoinClassDialog({
  variant = "default",
}: {
  variant?: "default" | "outline";
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<JoinClassFormValues>({
    resolver: zodResolver(joinClassSchema),
    defaultValues: {
      invite_code: "",
    },
  });

  function onSubmit(values: JoinClassFormValues) {
    joinClass(values).then((result) => {
      if (result.ok) {
        toast("Class joined successfully!");
        setOpen(false);
        window.location.reload(); // Refresh to show new class
      } else toast.error(result.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "outline" ? (
          <Button
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Join Your First Class
          </Button>
        ) : (
          <Button
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Join Class
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Class</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="invite_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter 7-character code" />
                    </FormControl>
                    <FormDescription>
                      Enter the 7-character class invite code provided by your
                      instructor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Join Class
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HomePage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getClasses().then((result) => {
      if (result.ok) {
        setClasses(result.value);
      } else {
        toast.error("Unable to load classes!");
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-64"></div>
          </div>
          <div className="h-10 bg-muted animate-pulse rounded w-32"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-muted animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-muted-foreground text-lg">
            {auth.role === "teacher"
              ? `You have ${classes.length} ${
                  classes.length === 1 ? "class" : "classes"
                } to manage`
              : `You're enrolled in ${classes.length} ${
                  classes.length === 1 ? "class" : "classes"
                }`}
          </p>
        </div>

        {auth.role === "teacher" ? (
          <Button
            onClick={() => navigate("/classes/create")}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Class
          </Button>
        ) : (
          <JoinClassDialog />
        )}
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <GraduationCap className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-muted-foreground">
              {auth.role === "teacher"
                ? "No classes created yet"
                : "No classes joined yet"}
            </h3>
            <p className="text-muted-foreground">
              {auth.role === "teacher"
                ? "Create your first class to start teaching"
                : "Join your first class to start learning"}
            </p>
          </div>
          {auth.role === "teacher" ? (
            <Button
              onClick={() => navigate("/classes/create")}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Class
            </Button>
          ) : (
            <JoinClassDialog variant="outline" />
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link key={cls.id} to={`/classes/${cls.id}`}>
              <Card className="h-full group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-0 shadow-lg hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {cls.section}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {cls.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="capitalize font-medium text-foreground">
                      {cls.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      {cls.student_count}{" "}
                      {cls.student_count === 1 ? "student" : "students"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-muted">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Teacher:
                      </span>{" "}
                      {cls.teacher.name ||
                        cls.teacher.username ||
                        cls.teacher.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
