export type UserRole = "customer" | "vendor" | "admin" | "delivery";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isEmailVerified?: boolean;
};

export type Category = {
  id: string;
  name: string;
  image: string;
  description: string;
  count: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  offerPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  unit: string;
  image: string;
  tags: string[];
  nutrition: string[];
  vendor: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line: string;
  city: string;
  pincode: string;
  isDefault: boolean;
};

export type Order = {
  id: string;
  status: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  total: number;
  placedAt: string;
  items: CartItem[];
  eta: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  sender: "customer" | "support" | "vendor";
  body: string;
  createdAt: string;
  read: boolean;
};
