import axiosInstance from "./axiosInstance";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
  admin: boolean;
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await axiosInstance.get<CurrentUser>("/auth/me");
  return response.data;
};
