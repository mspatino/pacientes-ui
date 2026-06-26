import axiosInstance from "./axiosInstance";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
  admin: boolean;
}

export interface ForgotPasswordResponse {
  message: string;
  resetUrl?: string | null;
}

export const hasAdminRole = (user: CurrentUser): boolean => {
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((role) => role.trim().toUpperCase() === "ROLE_ADMIN");
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await axiosInstance.get<CurrentUser>("/auth/me");
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<ForgotPasswordResponse> => {
  const response = await axiosInstance.post<ForgotPasswordResponse>("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  await axiosInstance.post("/auth/reset-password", { token, password });
};
