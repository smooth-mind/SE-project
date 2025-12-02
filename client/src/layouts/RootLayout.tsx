import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-auto md:ml-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
