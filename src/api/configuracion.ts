import axiosInstance from "./axiosInstance";

export interface AdminRole {
  id: number;
  name: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: string[];
  admin: boolean;
}

export interface AdminUserPayload {
  username: string;
  email: string;
  password?: string;
  enabled: boolean;
  roles: string[];
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await axiosInstance.get<AdminUser[]>("/admin/users");
  return response.data;
};

export const createAdminUser = async (payload: AdminUserPayload): Promise<AdminUser> => {
  const response = await axiosInstance.post<AdminUser>("/admin/users", payload);
  return response.data;
};

export const updateAdminUser = async (id: number, payload: AdminUserPayload): Promise<AdminUser> => {
  const response = await axiosInstance.put<AdminUser>(`/admin/users/${id}`, payload);
  return response.data;
};

export const deleteAdminUser = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/users/${id}`);
};

export const getAdminRoles = async (): Promise<AdminRole[]> => {
  const response = await axiosInstance.get<AdminRole[]>("/admin/roles");
  return response.data;
};

export const createAdminRole = async (name: string): Promise<AdminRole> => {
  const response = await axiosInstance.post<AdminRole>("/admin/roles", { name });
  return response.data;
};

export const deleteAdminRole = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/roles/${id}`);
};
