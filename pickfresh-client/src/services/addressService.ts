import { api } from "./api";
import type { Address } from "../types/domain";

const mapBackendAddress = (item: any): Address => ({
  id: item._id,
  label: item.isDefault ? "Home" : "Saved",
  fullName: item.fullName,
  phone: item.phone,
  line: `${item.houseNumber}, ${item.street}`,
  city: item.city,
  pincode: item.pincode,
  isDefault: item.isDefault,
});

export type CreateAddressPayload = {
  fullName: string;
  phone: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
};

export const addressService = {
  // GET /addresses
  async getAddresses(): Promise<Address[]> {
    const response = await api.get("/addresses");
    return (response.data.data || []).map(mapBackendAddress);
  },

  // GET /addresses/:id
  async getAddressById(id: string): Promise<Address> {
    const response = await api.get(`/addresses/${id}`);
    return mapBackendAddress(response.data.data);
  },

  // POST /addresses
  async createAddress(payload: CreateAddressPayload): Promise<Address> {
    const response = await api.post("/addresses", payload);
    return mapBackendAddress(response.data.data);
  },

  // PUT /addresses/:id
  async updateAddress(id: string, payload: Partial<CreateAddressPayload>): Promise<Address> {
    const response = await api.put(`/addresses/${id}`, payload);
    return mapBackendAddress(response.data.data);
  },

  // DELETE /addresses/:id
  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/addresses/${id}`);
  },
};
