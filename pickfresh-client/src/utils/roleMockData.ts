export const mockOrders = [
  { id: "PF-2026-1042", customer: "Sofiya Khan", email: "sofiya@email.com", product: "Organic Tomato × 3", total: 156, status: "Pending", date: "12 Jul 2026", payment: "COD" },
  { id: "PF-2026-1041", customer: "Aarav Mehta", email: "aarav@email.com", product: "Alphonso Mango × 1", total: 399, status: "Delivered", date: "11 Jul 2026", payment: "Card" },
  { id: "PF-2026-1040", customer: "Priya Sharma", email: "priya@email.com", product: "A2 Cow Milk × 2", total: 184, status: "Shipped", date: "11 Jul 2026", payment: "UPI" },
  { id: "PF-2026-1039", customer: "Rohan Nair", email: "rohan@email.com", product: "Sourdough Bread × 1", total: 149, status: "Confirmed", date: "10 Jul 2026", payment: "Wallet" },
  { id: "PF-2026-1038", customer: "Nisha Iyer", email: "nisha@email.com", product: "Baby Spinach × 2", total: 198, status: "Cancelled", date: "09 Jul 2026", payment: "Card" },
  { id: "PF-2026-1037", customer: "Vikram Das", email: "vikram@email.com", product: "Greek Yogurt × 3", total: 330, status: "Delivered", date: "08 Jul 2026", payment: "COD" },
  { id: "PF-2026-1036", customer: "Meera Patel", email: "meera@email.com", product: "Cold Pressed Juice × 2", total: 320, status: "Pending", date: "08 Jul 2026", payment: "UPI" },
  { id: "PF-2026-1035", customer: "Kiran Rao", email: "kiran@email.com", product: "Fresh Strawberries × 1", total: 189, status: "Packed", date: "07 Jul 2026", payment: "Card" },
];

export const mockProducts = [
  { id: "p1", name: "Organic Tomato", category: "Vegetables", price: 70, offerPrice: 52, stock: 70, sales: 124, rating: 4.8, status: "Active", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80" },
  { id: "p2", name: "Alphonso Mango", category: "Fruits", price: 480, offerPrice: 399, stock: 24, sales: 311, rating: 4.9, status: "Active", image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=300&q=80" },
  { id: "p3", name: "A2 Cow Milk", category: "Dairy", price: 92, offerPrice: null, stock: 140, sales: 89, rating: 4.6, status: "Active", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80" },
  { id: "p4", name: "Sourdough Bread", category: "Bakery", price: 180, offerPrice: 149, stock: 32, sales: 66, rating: 4.7, status: "Active", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=300&q=80" },
  { id: "p5", name: "Cold Pressed Juice", category: "Organic", price: 160, offerPrice: null, stock: 5, sales: 52, rating: 4.5, status: "Low Stock", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=300&q=80" },
  { id: "p6", name: "Baby Spinach", category: "Vegetables", price: 120, offerPrice: 99, stock: 0, sales: 41, rating: 4.4, status: "Out of Stock", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80" },
  { id: "p7", name: "Fresh Strawberries", category: "Fruits", price: 220, offerPrice: 189, stock: 30, sales: 95, rating: 4.7, status: "Active", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=300&q=80" },
  { id: "p8", name: "Greek Yogurt", category: "Dairy", price: 110, offerPrice: null, stock: 80, sales: 73, rating: 4.5, status: "Active", image: "https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&w=300&q=80" },
];

export const mockCustomers = [
  { id: "c1", name: "Sofiya Khan", email: "sofiya@email.com", orders: 12, spent: 4820, status: "Active", joined: "Jan 2026" },
  { id: "c2", name: "Aarav Mehta", email: "aarav@email.com", orders: 8, spent: 3210, status: "Active", joined: "Feb 2026" },
  { id: "c3", name: "Priya Sharma", email: "priya@email.com", orders: 5, spent: 1540, status: "Active", joined: "Mar 2026" },
  { id: "c4", name: "Rohan Nair", email: "rohan@email.com", orders: 3, spent: 890, status: "Blocked", joined: "Apr 2026" },
  { id: "c5", name: "Nisha Iyer", email: "nisha@email.com", orders: 15, spent: 6720, status: "Active", joined: "Dec 2025" },
  { id: "c6", name: "Vikram Das", email: "vikram@email.com", orders: 7, spent: 2340, status: "Active", joined: "Mar 2026" },
];

export const mockVendors = [
  { id: "v1", name: "GreenLeaf Farms", email: "greenleaf@vendor.com", products: 24, revenue: 84200, status: "Approved", joined: "Nov 2025" },
  { id: "v2", name: "PureMoo Dairy", email: "puremoo@vendor.com", products: 8, revenue: 42100, status: "Approved", joined: "Dec 2025" },
  { id: "v3", name: "Ovenly Bakery", email: "ovenly@vendor.com", products: 15, revenue: 31500, status: "Pending", joined: "Jun 2026" },
  { id: "v4", name: "JuiceLab Organic", email: "juicelab@vendor.com", products: 6, revenue: 18900, status: "Approved", joined: "Jan 2026" },
  { id: "v5", name: "BerryBest Fresh", email: "berrybest@vendor.com", products: 12, revenue: 27400, status: "Rejected", joined: "May 2026" },
];

export const mockDeliveryPartners = [
  { id: "d1", name: "Raju Kumar", email: "raju@delivery.com", assigned: 5, completed: 142, rating: 4.8, status: "Online", vehicle: "Bike" },
  { id: "d2", name: "Suresh Patil", email: "suresh@delivery.com", assigned: 3, completed: 98, rating: 4.6, status: "Online", vehicle: "Scooter" },
  { id: "d3", name: "Arjun Singh", email: "arjun@delivery.com", assigned: 0, completed: 214, rating: 4.9, status: "Offline", vehicle: "Bike" },
  { id: "d4", name: "Pradeep Yadav", email: "pradeep@delivery.com", assigned: 2, completed: 76, rating: 4.5, status: "Online", vehicle: "Cycle" },
];

export const mockCoupons = [
  { id: "cp1", code: "FRESH10", type: "Percentage", value: 10, minOrder: 199, used: 48, limit: 500, expiry: "31 Dec 2027", status: "Active" },
  { id: "cp2", code: "WELCOME50", type: "Fixed", value: 50, minOrder: 499, used: 120, limit: 1000, expiry: "31 Dec 2027", status: "Active" },
  { id: "cp3", code: "SAVE100", type: "Fixed", value: 100, minOrder: 999, used: 200, limit: 200, expiry: "30 Jun 2027", status: "Expired" },
  { id: "cp4", code: "ORGANIC20", type: "Percentage", value: 20, minOrder: 299, used: 33, limit: null, expiry: "31 Dec 2027", status: "Active" },
];

export const mockReviews = [
  { id: "r1", customer: "Sofiya Khan", product: "Organic Tomato", rating: 5, comment: "Absolutely fresh! Will order again.", date: "10 Jul 2026", status: "Visible" },
  { id: "r2", customer: "Aarav Mehta", product: "Alphonso Mango", rating: 5, comment: "Best mangoes I have ever tasted.", date: "09 Jul 2026", status: "Visible" },
  { id: "r3", customer: "Priya Sharma", product: "A2 Cow Milk", rating: 4, comment: "Good quality, slightly late delivery.", date: "08 Jul 2026", status: "Visible" },
  { id: "r4", customer: "Rohan Nair", product: "Sourdough Bread", rating: 2, comment: "Was a bit stale when it arrived.", date: "07 Jul 2026", status: "Flagged" },
  { id: "r5", customer: "Nisha Iyer", product: "Baby Spinach", rating: 5, comment: "Super clean and crisp spinach!", date: "06 Jul 2026", status: "Visible" },
];

export const revenueChartData = [
  { month: "Jan", revenue: 42000, orders: 120 },
  { month: "Feb", revenue: 58000, orders: 160 },
  { month: "Mar", revenue: 51000, orders: 140 },
  { month: "Apr", revenue: 74000, orders: 210 },
  { month: "May", revenue: 88000, orders: 255 },
  { month: "Jun", revenue: 96000, orders: 290 },
  { month: "Jul", revenue: 112000, orders: 340 },
];

export const categoryChartData = [
  { name: "Vegetables", value: 35 },
  { name: "Fruits", value: 28 },
  { name: "Dairy", value: 18 },
  { name: "Bakery", value: 12 },
  { name: "Organic", value: 7 },
];

export const deliveryAssigned = [
  { id: "PF-2026-1042", customer: "Sofiya Khan", phone: "+91 98765 43210", address: "12A, Green Park, Bengaluru - 560001", total: 156, distance: "2.4 km", status: "Assigned", items: "Organic Tomato × 3" },
  { id: "PF-2026-1040", customer: "Priya Sharma", phone: "+91 87654 32109", address: "45, MG Road, Bengaluru - 560025", total: 184, distance: "4.1 km", status: "Out For Delivery", items: "A2 Cow Milk × 2" },
  { id: "PF-2026-1039", customer: "Rohan Nair", phone: "+91 76543 21098", address: "8, Koramangala, Bengaluru - 560034", total: 149, distance: "1.8 km", status: "Assigned", items: "Sourdough Bread × 1" },
];
