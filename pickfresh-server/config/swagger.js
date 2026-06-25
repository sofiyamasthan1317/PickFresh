const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PickFresh API",
      version: "1.0.0",
      description: "API documentation for PickFresh Grocery App",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    tags: [
      { name: "Auth" },
      { name: "Products" },
      { name: "Categories" },
      { name: "Addresses" },
      { name: "Cart" },
      { name: "Wishlist" },
      { name: "Orders" },
      { name: "Reviews" },
      { name: "Coupons" },
    ],

    // 🔐 REQUIRED
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            name: { type: "string", example: "Organic Tomato" },
            price: { type: "number", example: 40 },
            category: { type: "string", example: "64f8f7d9e4b0b6d6a9d0f111" },
            images: { type: "array", items: { type: "string" } },
            description: { type: "string" },
            brand: { type: "string", example: "PickFresh" },
            stock: { type: "integer", example: 100 },
            unit: { type: "string", example: "kg" },
            offerPrice: { type: "number", example: 35 },
            isAvailable: { type: "boolean", example: true },
          },
        },
        Category: {
          type: "object",
          properties: {
            name: { type: "string", example: "Vegetables" },
            image: { type: "string" },
            description: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        Address: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            phone: { type: "string" },
            houseNumber: { type: "string" },
            street: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            pincode: { type: "string" },
            landmark: { type: "string" },
            isDefault: { type: "boolean" },
          },
        },
        Coupon: {
          type: "object",
          properties: {
            code: { type: "string", example: "FRESH10" },
            discountType: { type: "string", enum: ["percentage", "fixed"] },
            discountValue: { type: "number" },
            minimumAmount: { type: "number" },
            expiryDate: { type: "string", format: "date-time" },
            isActive: { type: "boolean" },
          },
        },
      },
      parameters: {
        IdParam: {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
        },
        ProductIdParam: {
          in: "path",
          name: "productId",
          required: true,
          schema: { type: "string" },
        },
      },
      requestBodies: {
        RegisterBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Sofiya" },
                  email: { type: "string", example: "sofiya@test.com" },
                  password: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        LoginBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "sofiya@test.com" },
                  password: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        RefreshTokenBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: { type: "string" },
                },
              },
            },
          },
        },
        ProductBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/Product" },
            },
            "application/json": {
              schema: { $ref: "#/components/schemas/Product" },
            },
          },
        },
        CategoryBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } },
        },
        AddressBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Address" } } },
        },
        CartItemBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["product"],
                properties: {
                  product: { type: "string" },
                  quantity: { type: "integer", example: 2 },
                },
              },
            },
          },
        },
        QuantityBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: { quantity: { type: "integer", example: 2 } },
              },
            },
          },
        },
        WishlistBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["product"],
                properties: { product: { type: "string" } },
              },
            },
          },
        },
        OrderBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["shippingAddress"],
                properties: {
                  shippingAddress: { type: "string" },
                  paymentMethod: { type: "string", enum: ["COD", "Card", "UPI", "Wallet"] },
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product: { type: "string" },
                        quantity: { type: "integer" },
                      },
                    },
                  },
                  deliveryCharge: { type: "number" },
                  tax: { type: "number" },
                  discount: { type: "number" },
                },
              },
            },
          },
        },
        OrderStatusBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  orderStatus: { type: "string", enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"] },
                  paymentStatus: { type: "string", enum: ["Pending", "Paid", "Failed"] },
                },
              },
            },
          },
        },
        ReviewBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["product", "rating"],
                properties: {
                  product: { type: "string" },
                  rating: { type: "integer", example: 5 },
                  comment: { type: "string" },
                },
              },
            },
          },
        },
        CouponBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Coupon" } } },
        },
        ApplyCouponBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "amount"],
                properties: {
                  code: { type: "string", example: "FRESH10" },
                  amount: { type: "number", example: 1200 },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a customer",
          requestBody: { $ref: "#/components/requestBodies/RegisterBody" },
          responses: { 201: { description: "User registered" }, 422: { description: "Validation error" } },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: { $ref: "#/components/requestBodies/LoginBody" },
          responses: { 200: { description: "User logged in" }, 401: { description: "Invalid credentials" } },
        },
      },
      "/api/auth/refresh-token": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: { $ref: "#/components/requestBodies/RefreshTokenBody" },
          responses: { 200: { description: "Access token generated" } },
        },
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List products with search, filters, sorting, and pagination",
          parameters: [
            { in: "query", name: "search", schema: { type: "string" } },
            { in: "query", name: "category", schema: { type: "string" } },
            { in: "query", name: "brand", schema: { type: "string" } },
            { in: "query", name: "minPrice", schema: { type: "number" } },
            { in: "query", name: "maxPrice", schema: { type: "number" } },
            { in: "query", name: "rating", schema: { type: "number" } },
            { in: "query", name: "isAvailable", schema: { type: "boolean" } },
            { in: "query", name: "sort", schema: { type: "string", enum: ["newest", "priceLowToHigh", "priceHighToLow", "highestRated"] } },
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Product list" } },
        },
        post: {
          tags: ["Products"],
          security: [{ bearerAuth: [] }],
          summary: "Create product",
          requestBody: { $ref: "#/components/requestBodies/ProductBody" },
          responses: { 201: { description: "Product created" }, 403: { description: "Admin access required" } },
        },
      },
      "/api/products/{id}": {
        get: { tags: ["Products"], summary: "Get product", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Product details" } } },
        put: { tags: ["Products"], security: [{ bearerAuth: [] }], summary: "Update product", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/ProductBody" }, responses: { 200: { description: "Product updated" } } },
        delete: { tags: ["Products"], security: [{ bearerAuth: [] }], summary: "Delete product", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Product removed" } } },
      },
      "/api/categories": {
        get: { tags: ["Categories"], summary: "List categories", responses: { 200: { description: "Category list" } } },
        post: { tags: ["Categories"], security: [{ bearerAuth: [] }], summary: "Create category", requestBody: { $ref: "#/components/requestBodies/CategoryBody" }, responses: { 201: { description: "Category created" } } },
      },
      "/api/categories/{id}": {
        get: { tags: ["Categories"], summary: "Get category", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Category details" } } },
        put: { tags: ["Categories"], security: [{ bearerAuth: [] }], summary: "Update category", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/CategoryBody" }, responses: { 200: { description: "Category updated" } } },
        delete: { tags: ["Categories"], security: [{ bearerAuth: [] }], summary: "Delete category", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Category removed" } } },
      },
      "/api/addresses": {
        get: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "List user addresses", responses: { 200: { description: "Address list" } } },
        post: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Create address", requestBody: { $ref: "#/components/requestBodies/AddressBody" }, responses: { 201: { description: "Address created" } } },
      },
      "/api/addresses/{id}": {
        get: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Get address", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Address details" } } },
        put: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Update address", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/AddressBody" }, responses: { 200: { description: "Address updated" } } },
        delete: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Delete address", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Address removed" } } },
      },
      "/api/cart": {
        get: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Get cart", responses: { 200: { description: "Cart details" } } },
        delete: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Clear cart", responses: { 200: { description: "Cart cleared" } } },
      },
      "/api/cart/items": {
        post: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Add item to cart", requestBody: { $ref: "#/components/requestBodies/CartItemBody" }, responses: { 201: { description: "Item added" } } },
      },
      "/api/cart/items/{productId}": {
        put: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Update cart quantity", parameters: [{ $ref: "#/components/parameters/ProductIdParam" }], requestBody: { $ref: "#/components/requestBodies/QuantityBody" }, responses: { 200: { description: "Quantity updated" } } },
        delete: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Remove cart item", parameters: [{ $ref: "#/components/parameters/ProductIdParam" }], responses: { 200: { description: "Item removed" } } },
      },
      "/api/wishlist": {
        get: { tags: ["Wishlist"], security: [{ bearerAuth: [] }], summary: "Get wishlist", responses: { 200: { description: "Wishlist details" } } },
        post: { tags: ["Wishlist"], security: [{ bearerAuth: [] }], summary: "Add product to wishlist", requestBody: { $ref: "#/components/requestBodies/WishlistBody" }, responses: { 201: { description: "Product added" } } },
      },
      "/api/wishlist/{productId}": {
        delete: { tags: ["Wishlist"], security: [{ bearerAuth: [] }], summary: "Remove product from wishlist", parameters: [{ $ref: "#/components/parameters/ProductIdParam" }], responses: { 200: { description: "Product removed" } } },
      },
      "/api/orders": {
        get: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "List orders", responses: { 200: { description: "Order list" } } },
        post: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "Create order", requestBody: { $ref: "#/components/requestBodies/OrderBody" }, responses: { 201: { description: "Order created" } } },
      },
      "/api/orders/{id}": {
        get: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "Get order", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Order details" } } },
        put: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "Update order status", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/OrderStatusBody" }, responses: { 200: { description: "Order updated" } } },
        delete: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "Delete order", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Order removed" } } },
      },
      "/api/reviews/product/{productId}": {
        get: { tags: ["Reviews"], summary: "List product reviews", parameters: [{ $ref: "#/components/parameters/ProductIdParam" }], responses: { 200: { description: "Review list" } } },
      },
      "/api/reviews": {
        post: { tags: ["Reviews"], security: [{ bearerAuth: [] }], summary: "Create review", requestBody: { $ref: "#/components/requestBodies/ReviewBody" }, responses: { 201: { description: "Review created" } } },
      },
      "/api/reviews/{id}": {
        put: { tags: ["Reviews"], security: [{ bearerAuth: [] }], summary: "Update review", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/ReviewBody" }, responses: { 200: { description: "Review updated" } } },
        delete: { tags: ["Reviews"], security: [{ bearerAuth: [] }], summary: "Delete review", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Review removed" } } },
      },
      "/api/coupons": {
        get: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "List coupons", responses: { 200: { description: "Coupon list" } } },
        post: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "Create coupon", requestBody: { $ref: "#/components/requestBodies/CouponBody" }, responses: { 201: { description: "Coupon created" } } },
      },
      "/api/coupons/{id}": {
        put: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "Update coupon", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/CouponBody" }, responses: { 200: { description: "Coupon updated" } } },
        delete: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "Delete coupon", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Coupon removed" } } },
      },
      "/api/coupons/validate": {
        post: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "Validate coupon", requestBody: { $ref: "#/components/requestBodies/ApplyCouponBody" }, responses: { 200: { description: "Coupon valid" } } },
      },
      "/api/coupons/apply": {
        post: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "Apply coupon", requestBody: { $ref: "#/components/requestBodies/ApplyCouponBody" }, responses: { 200: { description: "Discount calculated" } } },
      },
    },
  },

  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
