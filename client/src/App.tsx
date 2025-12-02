import { BrowserRouter, Route, Routes } from "react-router";
import AuthProvider from "./lib/AuthContext";
import { ThemeProvider } from "./lib/ThemeProvider";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import UnauthenticatedRoute from "@/components/UnauthenticatedRoute";
import SignupPage from "@/components/pages/SignupPage";
import LoginPage from "@/components/pages/LoginPage";
import Page404 from "@/components/pages/Page404";
import CreateAssignmentPage from "@/components/pages/CreateAssignmentPage";
import CreateClassPage from "@/components/pages/CreateClass";
import { Toaster } from "sonner";
import AssignmentDetailsPage from "@/components/pages/AssignmentDetailPage";
import JoinClass from "@/components/pages/JoinClass";
import HomePage from "@/components/pages/HomePage";
import ClassDetailPage from "./components/pages/ClassDetailPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/classes/:classId/"
                  element={<ClassDetailPage />}
                />
                <Route
                  path="/classes/:classId/assignments/:assignmentId"
                  element={<AssignmentDetailsPage />}
                />
              </Route>
              <Route element={<ProtectedRoute role="teacher" />}>
                <Route path="/classes/create" element={<CreateClassPage />} />
                <Route
                  path="/classes/:classId/assignments/create"
                  element={<CreateAssignmentPage />}
                />
              </Route>
              <Route element={<ProtectedRoute role="student" />}>
                <Route path="/classes/join" element={<JoinClass />} />
              </Route>
            </Route>
            <Route element={<UnauthenticatedRoute />}>
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route path="*" element={<Page404 />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
