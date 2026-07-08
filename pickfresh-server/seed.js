const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/UserModel");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Coupon = require("./models/Coupon");
const Order = require("./models/Order");
const Review = require("./models/Review");
const Address = require("./models/Address");
const Notification = require("./models/Notification");

const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=900&q=80`;

const mockUsers = [
  { name: "Admin Lead", email: "admin@pickfresh.local", password: "Admin@123", role: "admin", isEmailVerified: true },
  { name: "Vendor Partner", email: "vendor@pickfresh.local", password: "Vendor@123", role: "vendor", isEmailVerified: true, businessName: "GreenLeaf Farms", businessAddress: "12 Farm Road, Bengaluru", vendorStatus: "approved" },
  { name: "Delivery Partner", email: "delivery@pickfresh.local", password: "Delivery@123", role: "delivery", isEmailVerified: true, vehicleType: "Bike", vehicleNumber: "KA-01-AB-1234", isAvailable: true },
  { name: "Sofiya Khan", email: "customer@pickfresh.local", password: "Customer@123", role: "customer", isEmailVerified: true, phone: "+91 98765 43210" },
];

const mockCategories = [
  { name: "Vegetables", image: img("photo-1540420773420-3366772f4999"), description: "Farm-picked vegetables" },
  { name: "Fruits", image: img("photo-1619566636858-adf3ef46400b"), description: "Seasonal and imported fruits" },
  { name: "Dairy", image: img("photo-1628088062854-d1870b4553da"), description: "Milk, curd, butter and cheese" },
  { name: "Bakery", image: img("photo-1509440159596-0249088772ff"), description: "Fresh breads and breakfast bakes" },
  { name: "Organic", image: img("photo-1542838132-92c53300491e"), description: "Certified clean groceries" },
];

const mockCoupons = [
  { code: "FRESH10", discountType: "percentage", discountValue: 10, minimumAmount: 199, expiryDate: new Date("2027-12-31"), isActive: true, usageLimit: 500 },
  { code: "WELCOME50", discountType: "fixed", discountValue: 50, minimumAmount: 499, expiryDate: new Date("2027-12-31"), isActive: true, usageLimit: 1000 },
  { code: "SAVE100", discountType: "fixed", discountValue: 100, minimumAmount: 999, maxDiscount: 100, expiryDate: new Date("2027-06-30"), isActive: true, usageLimit: 200 },
  { code: "ORGANIC20", discountType: "percentage", discountValue: 20, minimumAmount: 299, maxDiscount: 150, expiryDate: new Date("2027-12-31"), isActive: true },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pickfresh";
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("Connected ✅");

    // Clear all collections
    await Promise.all([
      User.deleteMany(), Category.deleteMany(), Product.deleteMany(),
      Coupon.deleteMany(), Order.deleteMany(), Review.deleteMany(),
      Address.deleteMany(), Notification.deleteMany(),
    ]);
    console.log("Cleared existing data.");

    // Seed users with hashed passwords
    const hashedUsers = await Promise.all(
      mockUsers.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 12) }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Seeded ${createdUsers.length} users.`);
    createdUsers.forEach((u) => console.log(`  ${u.role.padEnd(10)} → ${u.email}`));

    const adminUser = createdUsers.find((u) => u.role === "admin");
    const vendorUser = createdUsers.find((u) => u.role === "vendor");
    const deliveryUser = createdUsers.find((u) => u.role === "delivery");
    const customerUser = createdUsers.find((u) => u.role === "customer");

    // Seed categories
    const createdCategories = await Category.insertMany(mockCategories);
    console.log(`Seeded ${createdCategories.length} categories.`);

    const catMap = Object.fromEntries(createdCategories.map((c) => [c.name, c._id]));

    // Seed products
    const mockProducts = [
      { name: "Organic Tomato", categoryName: "Vegetables", brand: "GreenLeaf", price: 70, offerPrice: 52, ratings: 4.8, reviewsCount: 124, stock: 70, unit: "kg", images: [img("photo-1592924357228-91a4daadcfea")], description: "Naturally fresh tomatoes", isOrganic: true, isFeatured: true },
      { name: "Alphonso Mango", categoryName: "Fruits", brand: "Ratnagiri Gold", price: 480, offerPrice: 399, ratings: 4.9, reviewsCount: 311, stock: 24, unit: "dozen", images: [img("photo-1601493700631-2b16ec4b4716")], description: "Sweet Ratnagiri Alphonso mangoes", isBestSeller: true, isTrending: true },
      { name: "A2 Cow Milk", categoryName: "Dairy", brand: "PureMoo", price: 92, ratings: 4.6, reviewsCount: 89, stock: 140, unit: "1L", images: [img("photo-1563636619-e9143da7973b")], description: "Pure A2 cow milk", isFeatured: true },
      { name: "Sourdough Bread", categoryName: "Bakery", brand: "Ovenly", price: 180, offerPrice: 149, ratings: 4.7, reviewsCount: 66, stock: 32, unit: "loaf", images: [img("photo-1549931319-a545dcf3bc73")], description: "Freshly baked artisan sourdough bread", isNewArrival: true },
      { name: "Cold Pressed Juice", categoryName: "Organic", brand: "JuiceLab", price: 160, ratings: 4.5, reviewsCount: 52, stock: 5, unit: "250ml", images: [img("photo-1622597467836-f3285f2131b8")], description: "All natural cold pressed organic juice", isOrganic: true },
      { name: "Baby Spinach", categoryName: "Vegetables", brand: "HydroFresh", price: 120, offerPrice: 99, ratings: 4.4, reviewsCount: 41, stock: 0, unit: "box", images: [img("photo-1576045057995-568f588f82fb")], description: "Clean hydroponic baby spinach", isOrganic: true },
      { name: "Fresh Strawberries", categoryName: "Fruits", brand: "BerryBest", price: 220, offerPrice: 189, ratings: 4.7, reviewsCount: 95, stock: 30, unit: "250g", images: [img("photo-1464965911861-746a04b4bca6")], description: "Juicy fresh strawberries", isTrending: true, isNewArrival: true },
      { name: "Greek Yogurt", categoryName: "Dairy", brand: "CreamyGood", price: 110, ratings: 4.5, reviewsCount: 73, stock: 80, unit: "400g", images: [img("photo-1570696516188-ade861b84a49")], description: "Thick and creamy greek yogurt", isBestSeller: true },
    ];

    const productsToCreate = mockProducts.map((p) => ({
      name: p.name, brand: p.brand, price: p.price, offerPrice: p.offerPrice ?? null,
      ratings: p.ratings, reviewsCount: p.reviewsCount, stock: p.stock, unit: p.unit,
      images: p.images, description: p.description,
      category: catMap[p.categoryName] || null,
      isAvailable: p.stock > 0,
      isOrganic: p.isOrganic || false, isFeatured: p.isFeatured || false,
      isTrending: p.isTrending || false, isNewArrival: p.isNewArrival || false,
      isBestSeller: p.isBestSeller || false,
      vendor: vendorUser._id, createdBy: vendorUser._id,
    }));

    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`Seeded ${createdProducts.length} products.`);

    // Seed address for customer
    const address = await Address.create({
      user: customerUser._id,
      fullName: customerUser.name,
      phone: "+91 98765 43210",
      houseNumber: "12A",
      street: "Green Park",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      landmark: "Near City Mall",
      label: "Home",
      isDefault: true,
    });

    // Seed 3 sample orders
    const orderStatuses = ["Delivered", "Pending", "Shipped"];
    const createdOrders = [];

    for (let i = 0; i < 3; i++) {
      const product = createdProducts[i];
      const qty = i + 1;
      const price = product.offerPrice ?? product.price;
      const subtotal = price * qty;
      const total = subtotal + 40 + Math.round(subtotal * 0.05);

      const order = await Order.create({
        orderId: `PF-2026-100${i + 1}`,
        user: customerUser._id,
        products: [{ product: product._id, name: product.name, quantity: qty, price, image: product.images[0] }],
        shippingAddress: address._id,
        paymentMethod: i === 0 ? "COD" : "Card",
        subtotal,
        deliveryCharge: 40,
        tax: Math.round(subtotal * 0.05),
        discount: 0,
        totalAmount: total,
        orderStatus: orderStatuses[i],
        paymentStatus: orderStatuses[i] === "Delivered" ? "Paid" : "Pending",
        assignedTo: orderStatuses[i] === "Shipped" ? deliveryUser._id : null,
        statusHistory: [{ status: "Pending", note: "Order placed" }, ...(orderStatuses[i] !== "Pending" ? [{ status: orderStatuses[i], note: "" }] : [])],
        deliveredAt: orderStatuses[i] === "Delivered" ? new Date() : null,
      });
      createdOrders.push(order);
    }
    console.log(`Seeded ${createdOrders.length} orders.`);

    // Seed reviews for the delivered order's product
    await Review.create({
      user: customerUser._id,
      product: createdProducts[0]._id,
      rating: 5,
      comment: "Absolutely fresh! Will order again.",
    });
    console.log("Seeded 1 review.");

    // Seed coupons
    const createdCoupons = await Coupon.insertMany(mockCoupons);
    console.log(`Seeded ${createdCoupons.length} coupons.`);

    // Seed welcome notification for customer
    await Notification.create({
      user: customerUser._id,
      title: "Welcome to PickFresh! 🌿",
      message: "Your account is ready. Start exploring fresh groceries.",
      type: "admin",
    });

    console.log("\n✅ Database seeding completed!");
    console.log("\n📋 Login Credentials:");
    console.log("  Admin    → admin@pickfresh.local     / Admin@123");
    console.log("  Vendor   → vendor@pickfresh.local    / Vendor@123");
    console.log("  Delivery → delivery@pickfresh.local  / Delivery@123");
    console.log("  Customer → customer@pickfresh.local  / Customer@123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
