const mongoose = require("mongoose");
require("dotenv").config();
const Category = require("./models/Category");
const Product = require("./models/Product");
const Coupon = require("./models/Coupon");

const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=900&q=80`;

const mockCategories = [
  { name: "Vegetables", image: img("photo-1540420773420-3366772f4999"), description: "Farm-picked vegetables" },
  { name: "Fruits", image: img("photo-1619566636858-adf3ef46400b"), description: "Seasonal and imported fruits" },
  { name: "Dairy", image: img("photo-1628088062854-d1870b4553da"), description: "Milk, curd, butter and cheese" },
  { name: "Bakery", image: img("photo-1509440159596-0249088772ff"), description: "Fresh breads and breakfast bakes" },
  { name: "Organic", image: img("photo-1542838132-92c53300491e"), description: "Certified clean groceries" },
];

const mockProducts = [
  { name: "Organic Tomato", categoryName: "Vegetables", brand: "GreenLeaf", price: 70, offerPrice: 52, ratings: 4.8, reviewsCount: 124, stock: 70, unit: "kg", images: [img("photo-1592924357228-91a4daadcfea")], description: "Naturally fresh tomatoes" },
  { name: "Alphonso Mango", categoryName: "Fruits", brand: "Ratnagiri Gold", price: 480, offerPrice: 399, ratings: 4.9, reviewsCount: 311, stock: 24, unit: "dozen", images: [img("photo-1601493700631-2b16ec4b4716")], description: "Sweet Ratnagiri Alphonso mangoes" },
  { name: "A2 Cow Milk", categoryName: "Dairy", brand: "PureMoo", price: 92, ratings: 4.6, reviewsCount: 89, stock: 140, unit: "1L", images: [img("photo-1563636619-e9143da7973b")], description: "Pure A2 cow milk" },
  { name: "Sourdough Bread", categoryName: "Bakery", brand: "Ovenly", price: 180, offerPrice: 149, ratings: 4.7, reviewsCount: 66, stock: 32, unit: "loaf", images: [img("photo-1549931319-a545dcf3bc73")], description: "Freshly baked artisan sourdough bread" },
  { name: "Cold Pressed Juice", categoryName: "Organic", brand: "JuiceLab", price: 160, ratings: 4.5, reviewsCount: 52, stock: 18, unit: "250ml", images: [img("photo-1622597467836-f3285f2131b8")], description: "All natural cold pressed organic juice" },
  { name: "Baby Spinach", categoryName: "Vegetables", brand: "HydroFresh", price: 120, offerPrice: 99, ratings: 4.4, reviewsCount: 41, stock: 45, unit: "box", images: [img("photo-1576045057995-568f588f82fb")], description: "Clean hydroponic baby spinach" },
];

const mockCoupons = [
  {
    code: "FRESH10",
    discountType: "percentage",
    discountValue: 10,
    minimumAmount: 199,
    expiryDate: new Date("2027-12-31"),
    isActive: true,
  },
  {
    code: "WELCOME50",
    discountType: "fixed",
    discountValue: 50,
    minimumAmount: 499,
    expiryDate: new Date("2027-12-31"),
    isActive: true,
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pickfresh";
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    console.log("Cleared existing categories and products.");

    // Insert categories
    const createdCategories = await Category.insertMany(mockCategories);
    console.log(`Seeded ${createdCategories.length} categories.`);

    // Map product category names to MongoDB object IDs
    const productsToCreate = mockProducts.map(p => {
      const cat = createdCategories.find(c => c.name === p.categoryName);
      return {
        name: p.name,
        brand: p.brand,
        price: p.price,
        offerPrice: p.offerPrice ?? null,
        ratings: p.ratings,
        reviewsCount: p.reviewsCount,
        stock: p.stock,
        unit: p.unit,
        images: p.images,
        description: p.description,
        category: cat ? cat._id : null,
        isAvailable: p.stock > 0
      };
    });

    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`Seeded ${createdProducts.length} products.`);

    const createdCoupons = await Coupon.insertMany(mockCoupons);
    console.log(`Seeded ${createdCoupons.length} coupons.`);

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
