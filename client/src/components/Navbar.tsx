import { useTheme } from "@/lib/ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, Settings } from "lucide-react";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { auth, logout } = useAuth();

  const getUserInitials = (
    name: string | undefined,
    email: string | undefined
  ) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.split("@")[0].slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Title with proper mobile spacing */}
        <div className="flex items-center gap-4 flex-1 md:flex-none">
          <div className="ml-12 md:ml-0">
            {" "}
            {/* Add left margin on mobile to avoid overlap with sidebar button */}
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                ClassManager
              </h1>
            </Link>
          </div>
        </div>

        {/* Right side - Theme switcher and User info with better mobile layout */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors h-8 w-8 p-0 md:h-auto md:w-auto md:p-2"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors h-9 px-2 rounded-lg"
              >
                <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {getUserInitials(auth.user?.name, auth.user?.email)}
                </div>
                <span className="font-medium hidden sm:block max-w-24 truncate">
                  {auth.user?.name || auth.user?.email?.split("@")[0] || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              {/* User Info Header */}
              <div className="px-3 py-3 mb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    {getUserInitials(auth.user?.name, auth.user?.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {auth.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {auth.user?.email}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                    {auth.role} account
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator className="my-2" />

              {/* Settings Option (Placeholder) */}
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Settings</p>
                  <p className="text-xs text-gray-500">Manage your account</p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              {/* Logout */}
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sign out</p>
                  <p className="text-xs text-red-500">
                    Log out of your account
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
