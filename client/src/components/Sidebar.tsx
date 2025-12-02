import { useEffect, useState } from "react";
import type { Class } from "@/types";
import { getClasses, joinClass } from "@/api/class";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/AuthContext";
import { Menu, X, Home, Plus, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
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
import { Link, useNavigate } from "react-router";

export function Sidebar() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getClasses().then((result) => {
      if (result.ok) setClasses(result.value);
      else toast("Unable to load classes!");
    });
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        {/* Navigation */}
        <div className="space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-blue-700 dark:text-blue-300 w-full"
            onClick={() => {
              if (window.innerWidth < 768) setIsOpen(false);
            }}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>

        {/* Classes Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Your Classes
            </h2>
            {auth.role === "teacher" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigate("/classes/create");
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="space-y-1">
            {classes.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No classes {auth.role === "teacher" ? "created" : "joined"} yet
              </p>
            ) : (
              classes.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/classes/${cls.id}`}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group w-full"
                  onClick={() => {
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                >
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors truncate">
                      {cls.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {cls.section}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t pt-4 space-y-2">
        {auth.role === "student" && <JoinClass />}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden hover:bg-blue-50 dark:hover:bg-blue-900/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative top-0 left-0 h-full bg-background border-r z-40 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          w-64 md:w-64
        `}
      >
        <div className="p-4 h-full">{sidebarContent}</div>
      </aside>
    </>
  );
}

const joinClassSchema = z.object({
  invite_code: z.string().length(7),
});
type JoinClassFormValues = z.infer<typeof joinClassSchema>;

function JoinClass() {
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
        <Button variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          Join Class
        </Button>
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
