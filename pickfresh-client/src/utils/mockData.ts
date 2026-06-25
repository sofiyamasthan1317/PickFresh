import { addDays, format } from "date-fns";
import type { Address, Category, ChatMessage, NotificationItem, Order, Product } from "../types/domain";

const img = (seed: string) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=900&q=80`;

export const categories: Category[] = [
  { id: "vegetables", name: "Vegetables", image: img("photo-1540420773420-3366772f4999"), description: "Farm-picked vegetables", count: 128 },
  { id: "fruits", name: "Fruits", image: img("photo-1619566636858-adf3ef46400b"), description: "Seasonal and imported fruits", count: 96 },
  { id: "dairy", name: "Dairy", image: img("photo-1628088062854-d1870b4553da"), description: "Milk, curd, butter and cheese", count: 54 },
  { id: "bakery", name: "Bakery", image: img("photo-1509440159596-0249088772ff"), description: "Fresh breads and breakfast bakes", count: 42 },
  { id: "organic", name: "Organic", image: img("photo-1542838132-92c53300491e"), description: "Certified clean groceries", count: 73 },
];

export const products: Product[] = [
  { id: "p1", name: "Organic Tomato", category: "Vegetables", brand: "GreenLeaf", price: 70, offerPrice: 52, rating: 4.8, reviews: 124, stock: 70, unit: "kg", image: img("photo-1592924357228-91a4daadcfea"), tags: ["Flash sale", "Organic"], nutrition: ["Vitamin C", "Low calorie"], vendor: "GreenLeaf Farms" },
  { id: "p2", name: "Alphonso Mango", category: "Fruits", brand: "Ratnagiri Gold", price: 480, offerPrice: 399, rating: 4.9, reviews: 311, stock: 24, unit: "dozen", image: img("photo-1601493700631-2b16ec4b4716"), tags: ["Trending", "Seasonal"], nutrition: ["Vitamin A", "Fiber"], vendor: "Konkan Fresh" },
  { id: "p3", name: "A2 Cow Milk", category: "Dairy", brand: "PureMoo", price: 92, rating: 4.6, reviews: 89, stock: 140, unit: "1L", image: img("photo-1563636619-e9143da7973b"), tags: ["Daily essential"], nutrition: ["Calcium", "Protein"], vendor: "PureMoo Dairy" },
  { id: "p4", name: "Sourdough Bread", category: "Bakery", brand: "Ovenly", price: 180, offerPrice: 149, rating: 4.7, reviews: 66, stock: 32, unit: "loaf", image: img("photo-1549931319-a545dcf3bc73"), tags: ["Baked today"], nutrition: ["Whole grain"], vendor: "Ovenly Bakery" },
  { id: "p5", name: "Cold Pressed Juice", category: "Organic", brand: "JuiceLab", price: 160, rating: 4.5, reviews: 52, stock: 18, unit: "250ml", image: img("photo-1622597467836-f3285f2131b8"), tags: ["No sugar"], nutrition: ["Antioxidants"], vendor: "JuiceLab" },
  { id: "p6", name: "Baby Spinach", category: "Vegetables", brand: "HydroFresh", price: 120, offerPrice: 99, rating: 4.4, reviews: 41, stock: 45, unit: "box", image: img("photo-1576045057995-568f588f82fb"), tags: ["Hydroponic"], nutrition: ["Iron", "Folate"], vendor: "HydroFresh" },
];

export const addresses: Address[] = [
  { id: "a1", label: "Home", fullName: "Sofiya Khan", phone: "9876543210", line: "14, Park Avenue, Indiranagar", city: "Bengaluru", pincode: "560038", isDefault: true },
  { id: "a2", label: "Work", fullName: "Sofiya Khan", phone: "9876543210", line: "PickFresh Labs, MG Road", city: "Bengaluru", pincode: "560001", isDefault: false },
];

export const orders: Order[] = [
  { id: "PF-2026-1042", status: "Shipped", total: 828, placedAt: format(addDays(new Date(), -1), "dd MMM yyyy"), items: [{ product: products[0], quantity: 2 }, { product: products[2], quantity: 1 }], eta: "Today, 7:30 PM" },
  { id: "PF-2026-0995", status: "Delivered", total: 1140, placedAt: format(addDays(new Date(), -8), "dd MMM yyyy"), items: [{ product: products[1], quantity: 2 }], eta: "Delivered" },
];

export const notifications: NotificationItem[] = [
  { id: "n1", title: "Flash sale is live", body: "Fresh vegetables are up to 35% off for the next hour.", read: false, createdAt: "Just now" },
  { id: "n2", title: "Order shipped", body: "Your order PF-2026-1042 is out for delivery.", read: false, createdAt: "12 min ago" },
  { id: "n3", title: "Wallet cashback", body: "₹50 cashback was added to your PickFresh wallet.", read: true, createdAt: "Yesterday" },
];

export const messages: ChatMessage[] = [
  { id: "m1", sender: "support", body: "Hi! Need help choosing ingredients today?", createdAt: "10:24", read: true },
  { id: "m2", sender: "customer", body: "Can you suggest produce for pasta night?", createdAt: "10:25", read: true },
  { id: "m3", sender: "support", body: "Absolutely. Cherry tomatoes, basil, garlic, and parmesan are trending picks.", createdAt: "10:25", read: false },
];
