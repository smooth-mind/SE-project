import type { APIError, APIResponse, Result } from "@/types";
import { AxiosError } from "axios";

const statusMessages: Record<number, string> = {
    400: "Bad request. Please check your input.",
    401: "Unauthorized. Please log in.",
    403: "Forbidden. You don't have permission.",
    404: "Not found. The resource does not exist.",
    500: "Server error. Please try again later.",
};

export function success<T>(value: T): Result<T, APIError> {
    return { ok: true, value }
}

export function failure<T>(error: APIError): Result<T, APIError> {
    return { ok: false, error }
}

export async function apiCall<T>(fn: () => Promise<{ data: any }>): APIResponse<T> {
    try {
        const response = await fn();
        return { ok: true, value: response.data };
    } catch (error) {
        const axiosError = error as AxiosError<{ [key: string]: string }>;
        const status = axiosError.response?.status;

        const errors = Object.values(axiosError.response?.data ?? {})
        const errMsg = errors.length > 0 ? errors[0] :
            (status ? statusMessages[status] || `Error ${status}` : "Unknown error");
        return { ok: false, error: errMsg };
    }
}

export function handleError<T>(data: any): Result<T, APIError> {
    if ("error" in data)
        return failure(data.error)
    if ("errors" in data)
        return failure(data.errors)
    return failure("something went wrong")
}


