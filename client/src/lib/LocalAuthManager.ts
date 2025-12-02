import type { LoginResponse } from "@/api/accounts";

export function save(data: LoginResponse) {
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    localStorage.setItem('role', data.role)
}

export function getAccessToken() {
    return localStorage.getItem("access");
}

export function getRefreshToken() {
    return localStorage.getItem("refresh");
}

export function getRole() {
    return localStorage.getItem("role")
}

export function clear() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('role')
}

export function hasData(): boolean {
    return !!getAccessToken() && !!getRefreshToken() && !!getRole()
}
