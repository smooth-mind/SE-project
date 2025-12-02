import { createContext, useContext, useState, useEffect } from "react";
import * as api from "@/api/accounts";
import * as LocalAuthManager from "./LocalAuthManager";
import { toast } from "sonner";
import type { LoginPayload } from "@/components/forms/LoginForm";
import type { SignupPayload } from "@/components/forms/SignupForm";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  isLoggedIn: boolean;
  role: string;
};

type TAuthContext = {
  auth: AuthState;
  signup: (payload: SignupPayload) => void;
  login: (payload: LoginPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<TAuthContext>({
  auth: { isLoggedIn: false, role: "", user: null },
  signup: (_) => {},
  login: (_) => {},
  logout: () => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: LocalAuthManager.hasData(),
    role: LocalAuthManager.getRole() ?? "",
    user: null,
  });

  // Fetch user data on mount if logged in
  useEffect(() => {
    if (auth.isLoggedIn && !auth.user) {
      api.getUser().then((result) => {
        if (result.ok) {
          setAuth((prev) => ({ ...prev, user: result.value.user }));
        }
      });
    }
  }, [auth.isLoggedIn, auth.user]);

  async function signup(payload: SignupPayload) {
    const result = await api.register(payload);
    if (result.ok) {
      toast.success("Account created successfully! You can now log in.");
    } else {
      // Provide more specific error messages for common issues
      let errorMessage = result.error;
      if (result.error.toLowerCase().includes("email")) {
        errorMessage =
          "This email is already registered. Please use a different email or try logging in.";
      } else if (result.error.toLowerCase().includes("password")) {
        errorMessage = "Password must be at least 4 characters long.";
      }
      toast.error(errorMessage);
    }
  }

  async function login(payload: LoginPayload) {
    const result = await api.login(payload);
    if (result.ok) {
      const response = result.value;
      LocalAuthManager.save(response);
      setAuth({
        role: response.role,
        isLoggedIn: true,
        user: null, // Will be fetched by useEffect
      });
      toast.success("Welcome back! Logged in successfully.");
    } else {
      // Provide more specific error messages for login issues
      let errorMessage = result.error;
      if (
        result.error.toLowerCase().includes("invalid") ||
        result.error.toLowerCase().includes("credentials") ||
        result.error.toLowerCase().includes("unable to log in")
      ) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (result.error.toLowerCase().includes("email")) {
        errorMessage = "Please enter a valid email address.";
      }
      toast.error(errorMessage);
    }
  }

  function logout() {
    console.log("user logged out");
    LocalAuthManager.clear();
    setAuth({
      isLoggedIn: false,
      role: "",
      user: null,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
