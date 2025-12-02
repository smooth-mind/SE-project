import { apiCall } from "./utils";
import axiosInstance from "./axios-instance";
import type { APIResponse } from "@/types";
import type { LoginPayload } from "@/components/forms/LoginForm";
import type { SignupPayload } from "@/components/forms/SignupForm";

export type LoginResponse = { access: string; refresh: string; role: string };
export type RegisterResponse = { access: string; refresh: string };
export type UserResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export async function login(payload: LoginPayload): APIResponse<LoginResponse> {
  return apiCall<LoginResponse>(() =>
    axiosInstance.post("accounts/login/", payload)
  );
}

export async function register(
  payload: SignupPayload
): APIResponse<RegisterResponse> {
  return apiCall<RegisterResponse>(() =>
    axiosInstance.post("accounts/register/", payload)
  );
}

export async function getUser(): APIResponse<UserResponse> {
  return apiCall<UserResponse>(() => axiosInstance.get("accounts/"));
}
