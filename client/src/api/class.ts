import { apiCall } from "./utils";
import axiosInstance from "./axios-instance";
import type { APIResponse, Class, ClassDetails } from "@/types";
import type { ClassPayload } from "@/components/pages/CreateClass";
import type { JoinClassPayload } from "@/components/pages/JoinClass";

export type CreateClassResponse = {};
export type JoinClassResponse = {};
export type GetClassesResponse = Class[];
export type GetClassResponse = ClassDetails;

export async function createClass(
  payload: ClassPayload
): APIResponse<CreateClassResponse> {
  return apiCall<CreateClassResponse>(() =>
    axiosInstance.post("classes/create/", payload)
  );
}

export async function getClasses(): APIResponse<GetClassesResponse> {
  return apiCall<GetClassesResponse>(() => axiosInstance.get("classes/"));
}

export async function getClass(id: number): APIResponse<GetClassResponse> {
  return apiCall<GetClassResponse>(() => axiosInstance.get(`classes/${id}/`));
}

export async function joinClass(
  payload: JoinClassPayload
): APIResponse<JoinClassResponse> {
  return apiCall<JoinClassResponse>(() =>
    axiosInstance.post("classes/join/", payload)
  );
}
