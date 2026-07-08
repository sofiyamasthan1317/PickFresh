import { api } from "./api";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
};

const mapUser = (item: any): UserListItem => ({
  id: item._id,
  name: item.name,
  email: item.email,
  role: item.role,
  isEmailVerified: item.isEmailVerified,
  createdAt: item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "",
});

export const userService = {
  async getAllUsers(page = 1, limit = 20): Promise<UserListItem[]> {
    const response = await api.get("/users", { params: { page, limit } });
    return (response.data.data || []).map(mapUser);
  },

  async getUserById(id: string): Promise<UserListItem> {
    const response = await api.get(`/users/${id}`);
    return mapUser(response.data.data);
  },

  async updateUserRole(id: string, role: string): Promise<UserListItem> {
    const response = await api.put(`/users/${id}/role`, { role });
    return mapUser(response.data.data);
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const form = new FormData();
    form.append("avatar", file);
    const response = await api.post("/users/upload-avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },
};
