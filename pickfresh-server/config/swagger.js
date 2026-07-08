const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PickFresh API",
      version: "1.0.0",
      description:
        "Complete API documentation for the PickFresh Grocery App. Covers Customer, Admin, Vendor and Delivery Partner modules.",
    },
    servers: [{ url: "http://localhost:5000", description: "Local Development" }],
    tags: [
      { name: "Auth", description: "Registration, login, OTP, tokens" },
      { name: "Products", description: "Product listing, search, filters" },
      { name: "Categories", description: "Category management" },
      { name: "Addresses", description: "User address book" },
      { name: "Cart", description: "Shopping cart" },
      { name: "Wishlist", description: "Saved products" },
      { name: "Orders", description: "Order placement and tracking" },
      { name: "Reviews", description: "Product reviews and ratings" },
      { name: "Coupons", description: "Discount coupons" },
      { name: "Wallet", description: "User wallet and transactions" },
      { name: "Payments", description: "Stripe payment intent and webhook" },
      { name: "Banners", description: "Homepage promotional banners" },
      { name: "Search", description: "Unified product search" },
      { name: "Notifications", description: "In-app notifications" },
      { name: "Admin", description: "Admin-only management endpoints" },
      { name: "Vendor", description: "Vendor product and order management" },
      { name: "Delivery", description: "Delivery partner dashboard and status updates" },
    ],

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
        Banner: {
          type: "object",
          properties: {
            title: { type: "string", example: "Summer Sale" },
            subtitle: { type: "string" },
            image: { type: "string" },
            link: { type: "string" },
            isActive: { type: "boolean" },
            order: { type: "integer" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
            errors: { type: "object", nullable: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            data: { type: "object" },
            errors: { type: "object" },
          },
        },
      },
      parameters: {
        IdParam: {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "MongoDB ObjectId",
        },
        ProductIdParam: {
          in: "path",
          name: "productId",
          required: true,
          schema: { type: "string" },
        },
        PageParam: {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
        },
        LimitParam: {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 20 },
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
                  password: { type: "string", example: "Secret@123" },
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
                  password: { type: "string", example: "Secret@123" },
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
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        ProductBody: {
          required: true,
          content: {
            "multipart/form-data": { schema: { $ref: "#/components/schemas/Product" } },
            "application/json": { schema: { $ref: "#/components/schemas/Product" } },
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
                  couponCode: { type: "string", example: "FRESH10" },
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
                  orderStatus: {
                    type: "string",
                    enum: ["Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled"],
                  },
                  note: { type: "string" },
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
                  rating: { type: "integer", example: 5, minimum: 1, maximum: 5 },
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
        BannerBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Banner" } } },
        },
        PaymentIntentBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId"],
                properties: { orderId: { type: "string" } },
              },
            },
          },
        },
        WalletTopupBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount"],
                properties: { amount: { type: "number", example: 500 } },
              },
            },
          },
        },
      },
    },

    paths: {
      // ─── AUTH ────────────────────────────────────────────────────────────────
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new customer",
          requestBody: { $ref: "#/components/requestBodies/RegisterBody" },
          responses: { 201: { description: "OTP sent. Verify email to activate account." }, 422: { description: "Validation error" } },
        },
      },
      "/api/auth/verify-otp": {
        post: {
          tags: ["Auth"],
          summary: "Verify email OTP",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "otp"],
                  properties: { email: { type: "string" }, otp: { type: "string" } },
                },
              },
            },
          },
          responses: { 200: { description: "Email verified, tokens returned" } },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          requestBody: { $ref: "#/components/requestBodies/LoginBody" },
          responses: { 200: { description: "Access and refresh tokens returned" }, 401: { description: "Invalid credentials" } },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout (invalidate refresh token)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Logged out" } },
        },
      },
      "/api/auth/refresh-token": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: { $ref: "#/components/requestBodies/RefreshTokenBody" },
          responses: { 200: { description: "New access token issued" } },
        },
      },
      "/api/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Request password reset OTP",
          requestBody: {
            content: {
              "application/json": {
                schema: { type: "object", properties: { email: { type: "string" } } },
              },
            },
          },
          responses: { 200: { description: "OTP sent to email" } },
        },
      },
      "/api/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Reset password using OTP",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    otp: { type: "string" },
                    newPassword: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Password reset successful" } },
        },
      },

      // ─── PRODUCTS ─────────────────────────────────────────────────────────
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List products with filters, sorting, pagination",
          parameters: [
            { in: "query", name: "search", schema: { type: "string" } },
            { in: "query", name: "category", schema: { type: "string" } },
            { in: "query", name: "brand", schema: { type: "string" } },
            { in: "query", name: "minPrice", schema: { type: "number" } },
            { in: "query", name: "maxPrice", schema: { type: "number" } },
            { in: "query", name: "rating", schema: { type: "number" } },
            { in: "query", name: "isOrganic", schema: { type: "boolean" } },
            { in: "query", name: "isAvailable", schema: { type: "boolean" } },
            { in: "query", name: "sort", schema: { type: "string", enum: ["newest", "priceLowToHigh", "priceHighToLow", "highestRated"] } },
            { $ref: "#/components/parameters/PageParam" },
            { $ref: "#/components/parameters/LimitParam" },
          ],
          responses: { 200: { description: "Product list with pagination" } },
        },
        post: {
          tags: ["Products"],
          security: [{ bearerAuth: [] }],
          summary: "Create product (Admin/Vendor)",
          requestBody: { $ref: "#/components/requestBodies/ProductBody" },
          responses: { 201: { description: "Product created" }, 403: { description: "Access denied" } },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product details",
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          responses: { 200: { description: "Product details" } },
        },
        put: {
          tags: ["Products"],
          security: [{ bearerAuth: [] }],
          summary: "Update product",
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          requestBody: { $ref: "#/components/requestBodies/ProductBody" },
          responses: { 200: { description: "Updated product" } },
        },
        delete: {
          tags: ["Products"],
          security: [{ bearerAuth: [] }],
          summary: "Delete product",
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          responses: { 200: { description: "Product deleted" } },
        },
      },

      // ─── CATEGORIES ───────────────────────────────────────────────────────
      "/api/categories": {
        get: { tags: ["Categories"], summary: "List all active categories", responses: { 200: { description: "Category list" } } },
        post: { tags: ["Categories"], security: [{ bearerAuth: [] }], summary: "Create category (Admin)", requestBody: { $ref: "#/components/requestBodies/CategoryBody" }, responses: { 201: { description: "Category created" } } },
      },
      "/api/categories/{id}": {
        get: { tags: ["Categories"], summary: "Get category by ID", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Category details" } } },
        put: { tags: ["Categories"], security: [{ bearerAuth: [] }], summary: "Update category", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/CategoryBody" }, responses: { 200: { description: "Category updated" } } },
        delete: { tags: ["Categories"], security: [{ bearerAuth: [] }], summary: "Delete category", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Category deleted" } } },
      },

      // ─── ADDRESSES ────────────────────────────────────────────────────────
      "/api/addresses": {
        get: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Get all addresses for current user", responses: { 200: { description: "Address list" } } },
        post: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Create address", requestBody: { $ref: "#/components/requestBodies/AddressBody" }, responses: { 201: { description: "Address created" } } },
      },
      "/api/addresses/{id}": {
        get: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Get address", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Address details" } } },
        put: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Update address", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/AddressBody" }, responses: { 200: { description: "Address updated" } } },
        delete: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Delete address", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Address deleted" } } },
      },
      "/api/addresses/{id}/default": {
        patch: { tags: ["Addresses"], security: [{ bearerAuth: [] }], summary: "Set address as default", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Default address updated" } } },
      },

      // ─── CART ─────────────────────────────────────────────────────────────
      "/api/cart": {
        get: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Get current user's cart", responses: { 200: { description: "Cart with totals" } } },
        delete: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Clear entire cart", responses: { 200: { description: "Cart cleared" } } },
      },
      "/api/cart/items": {
        post: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Add item to cart", requestBody: { $ref: "#/components/requestBodies/CartItemBody" }, responses: { 201: { description: "Item added" } } },
      },
      "/api/cart/items/{productId}": {
        put: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Update item quantity", parameters: [{ $ref: "#/components/parameters/ProductIdParam" }], requestBody: { $ref: "#/components/requestBodies/QuantityBody" }, responses: { 200: { description: "Quantity updated" } } },
        delete: { tags: ["Cart"], security: [{ bearerAuth: [] }], summary: "Remove item from cart", parameters: [{ $ref: "#/components/parameters/ProductIdParam" }], responses: { 200: { description: "Item removed" } } },
      },

      // ─── WISHLIST ─────────────────────────────────────────────────────────
      "/api/wishlist": {
        get: { tags: ["Wishlist"], security: [{ bearerAuth: [] }], summary: "Get wishlist", responses: { 200: { description: "Wishlist" } } },
        post: { tags: ["Wishlist"], security: [{ bearerAuth: [] }], summary: "Add product to wishlist", requestBody: { $ref: "#/components/requestBodies/WishlistBody" }, responses: { 201: { description: "Added to wishlist" } } },
      },
      "/api/wishlist/{productId}": {
        delete: { tags: ["Wishlist"], security: [{ bearerAuth: [] }], summary: "Remove from wishlist", parameters: [{ $ref: "#/components/parameters/ProductIdParam" }], responses: { 200: { description: "Removed from wishlist" } } },
      },

      // ─── ORDERS ───────────────────────────────────────────────────────────
      "/api/orders": {
        get: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "List user orders", parameters: [{ $ref: "#/components/parameters/PageParam" }, { $ref: "#/components/parameters/LimitParam" }], responses: { 200: { description: "Order list" } } },
        post: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "Place a new order", requestBody: { $ref: "#/components/requestBodies/OrderBody" }, responses: { 201: { description: "Order placed" } } },
      },
      "/api/orders/{id}": {
        get: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "Get order details", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Order details" } } },
        put: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "Update order status (Admin)", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/OrderStatusBody" }, responses: { 200: { description: "Order status updated" } } },
      },
      "/api/orders/{id}/cancel": {
        patch: { tags: ["Orders"], security: [{ bearerAuth: [] }], summary: "Cancel order", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Order cancelled" } } },
      },

      // ─── REVIEWS ──────────────────────────────────────────────────────────
      "/api/reviews/product/{productId}": {
        get: { tags: ["Reviews"], summary: "Get reviews for a product", parameters: [{ $ref: "#/components/parameters/ProductIdParam" }], responses: { 200: { description: "Review list" } } },
      },
      "/api/reviews": {
        post: { tags: ["Reviews"], security: [{ bearerAuth: [] }], summary: "Create a review", requestBody: { $ref: "#/components/requestBodies/ReviewBody" }, responses: { 201: { description: "Review created" } } },
      },
      "/api/reviews/{id}": {
        put: { tags: ["Reviews"], security: [{ bearerAuth: [] }], summary: "Update review", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/ReviewBody" }, responses: { 200: { description: "Review updated" } } },
        delete: { tags: ["Reviews"], security: [{ bearerAuth: [] }], summary: "Delete review", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Review deleted" } } },
      },

      // ─── COUPONS ──────────────────────────────────────────────────────────
      "/api/coupons": {
        get: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "List all coupons (Admin)", responses: { 200: { description: "Coupon list" } } },
        post: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "Create coupon (Admin)", requestBody: { $ref: "#/components/requestBodies/CouponBody" }, responses: { 201: { description: "Coupon created" } } },
      },
      "/api/coupons/validate": {
        post: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "Validate coupon against order amount", requestBody: { $ref: "#/components/requestBodies/ApplyCouponBody" }, responses: { 200: { description: "Coupon valid with discount value" } } },
      },
      "/api/coupons/{id}": {
        put: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "Update coupon", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/CouponBody" }, responses: { 200: { description: "Coupon updated" } } },
        delete: { tags: ["Coupons"], security: [{ bearerAuth: [] }], summary: "Delete coupon", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Coupon deleted" } } },
      },

      // ─── WALLET ───────────────────────────────────────────────────────────
      "/api/wallet": {
        get: {
          tags: ["Wallet"],
          security: [{ bearerAuth: [] }],
          summary: "Get wallet balance with recent transactions",
          parameters: [{ $ref: "#/components/parameters/PageParam" }, { $ref: "#/components/parameters/LimitParam" }],
          responses: { 200: { description: "Wallet data" } },
        },
      },
      "/api/wallet/balance": {
        get: {
          tags: ["Wallet"],
          security: [{ bearerAuth: [] }],
          summary: "Get wallet balance only",
          responses: { 200: { description: "Wallet balance" } },
        },
      },
      "/api/wallet/add-money": {
        post: {
          tags: ["Wallet"],
          security: [{ bearerAuth: [] }],
          summary: "Add money to wallet",
          requestBody: { $ref: "#/components/requestBodies/WalletTopupBody" },
          responses: { 200: { description: "Wallet credited" } },
        },
      },
      "/api/wallet/pay": {
        post: {
          tags: ["Wallet"],
          security: [{ bearerAuth: [] }],
          summary: "Pay from wallet",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["amount"],
                  properties: {
                    amount: { type: "number", example: 250 },
                    description: { type: "string", example: "Wallet payment" },
                    orderId: { type: "string", example: "64f..." },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Wallet payment completed" } },
        },
      },
      "/api/wallet/transactions": {
        get: {
          tags: ["Wallet"],
          security: [{ bearerAuth: [] }],
          summary: "Get full wallet transaction history",
          parameters: [{ $ref: "#/components/parameters/PageParam" }, { $ref: "#/components/parameters/LimitParam" }, { in: "query", name: "type", schema: { type: "string", enum: ["all", "credit", "debit", "refund", "cashback", "payment"] } }],
          responses: { 200: { description: "Transaction list" } },
        },
      },

      // ─── PAYMENTS ─────────────────────────────────────────────────────────
      "/api/payments/create-intent": {
        post: {
          tags: ["Payments"],
          security: [{ bearerAuth: [] }],
          summary: "Create Stripe Payment Intent for an order",
          requestBody: { $ref: "#/components/requestBodies/PaymentIntentBody" },
          responses: { 200: { description: "Stripe clientSecret returned" } },
        },
      },
      "/api/payments/webhook": {
        post: {
          tags: ["Payments"],
          summary: "Stripe webhook (called by Stripe — do not call manually)",
          responses: { 200: { description: "Event received" } },
        },
      },

      // ─── VENDOR PROFILE ───────────────────────────────────────────────────
      "/api/vendor/profile": {
        get: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Get current vendor profile", responses: { 200: { description: "Vendor profile" } } },
        put: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Update vendor profile", responses: { 200: { description: "Profile updated" } } },
      },
      "/api/vendor/profile/logo": {
        patch: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Upload vendor logo", responses: { 200: { description: "Logo updated" } } },
      },
      "/api/vendor/profile/cover": {
        patch: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Upload vendor cover image", responses: { 200: { description: "Cover updated" } } },
      },
      // ─── ADMIN SETTINGS ───────────────────────────────────────────────────
      "/api/admin/settings": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Get platform settings", responses: { 200: { description: "Platform settings" } } },
        put: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Update platform settings", responses: { 200: { description: "Settings updated" } } },
      },
      // ─── BANNERS ──────────────────────────────────────────────────────────
      "/api/banners": {
        get: { tags: ["Banners"], summary: "Get all active banners", responses: { 200: { description: "Banner list" } } },
        post: { tags: ["Banners"], security: [{ bearerAuth: [] }], summary: "Create banner (Admin)", requestBody: { $ref: "#/components/requestBodies/BannerBody" }, responses: { 201: { description: "Banner created" } } },
      },
      "/api/banners/{id}": {
        put: { tags: ["Banners"], security: [{ bearerAuth: [] }], summary: "Update banner", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/BannerBody" }, responses: { 200: { description: "Banner updated" } } },
        delete: { tags: ["Banners"], security: [{ bearerAuth: [] }], summary: "Delete banner", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Banner deleted" } } },
      },

      // ─── SEARCH ───────────────────────────────────────────────────────────
      "/api/search": {
        get: {
          tags: ["Search"],
          summary: "Full-text search across products",
          parameters: [
            { in: "query", name: "q", required: true, schema: { type: "string" }, description: "Search query" },
            { in: "query", name: "category", schema: { type: "string" } },
            { in: "query", name: "minPrice", schema: { type: "number" } },
            { in: "query", name: "maxPrice", schema: { type: "number" } },
            { $ref: "#/components/parameters/PageParam" },
            { $ref: "#/components/parameters/LimitParam" },
          ],
          responses: { 200: { description: "Matching products with pagination" } },
        },
      },

      // ─── NOTIFICATIONS ────────────────────────────────────────────────────
      "/api/notifications": {
        get: {
          tags: ["Notifications"],
          security: [{ bearerAuth: [] }],
          summary: "Get notifications for current user",
          parameters: [{ $ref: "#/components/parameters/PageParam" }],
          responses: { 200: { description: "Notification list" } },
        },
      },
      "/api/notifications/read-all": {
        patch: {
          tags: ["Notifications"],
          security: [{ bearerAuth: [] }],
          summary: "Mark all notifications as read",
          responses: { 200: { description: "All marked as read" } },
        },
      },
      "/api/notifications/{id}/read": {
        patch: {
          tags: ["Notifications"],
          security: [{ bearerAuth: [] }],
          summary: "Mark single notification as read",
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          responses: { 200: { description: "Notification read" } },
        },
      },

      // ─── ADMIN ────────────────────────────────────────────────────────────
      "/api/admin/dashboard": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Admin dashboard: revenue, users, orders, trends", responses: { 200: { description: "Dashboard metrics" } } },
      },
      "/api/admin/users": {
        get: {
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          summary: "List all users (filterable by role, blocked, search)",
          parameters: [
            { in: "query", name: "role", schema: { type: "string", enum: ["customer", "vendor", "admin", "delivery"] } },
            { in: "query", name: "search", schema: { type: "string" } },
            { in: "query", name: "isBlocked", schema: { type: "boolean" } },
            { $ref: "#/components/parameters/PageParam" },
            { $ref: "#/components/parameters/LimitParam" },
          ],
          responses: { 200: { description: "User list" } },
        },
      },
      "/api/admin/users/{id}": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Get user by ID with order history", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "User details" } } },
        put: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Update user", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "User updated" } } },
        delete: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Delete user", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "User deleted" } } },
      },
      "/api/admin/users/{id}/block": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Block user", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "User blocked" } } },
      },
      "/api/admin/users/{id}/unblock": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Unblock user", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "User unblocked" } } },
      },
      "/api/admin/users/{id}/role": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Change user role", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Role updated" } } },
      },
      "/api/admin/vendors": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "List all vendors", parameters: [{ in: "query", name: "status", schema: { type: "string", enum: ["pending", "approved", "rejected", "suspended"] } }], responses: { 200: { description: "Vendor list" } } },
      },
      "/api/admin/vendors/{id}/approve": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Approve vendor application", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Vendor approved" } } },
      },
      "/api/admin/vendors/{id}/reject": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Reject vendor application", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Vendor rejected" } } },
      },
      "/api/admin/vendors/{id}/suspend": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Suspend vendor", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Vendor suspended" } } },
      },
      "/api/admin/delivery-partners": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "List all delivery partners", responses: { 200: { description: "Delivery partner list" } } },
      },
      "/api/admin/delivery-partners/{id}/suspend": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Suspend delivery partner", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Partner suspended" } } },
      },
      "/api/admin/delivery-partners/{id}/activate": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Activate delivery partner", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Partner activated" } } },
      },
      "/api/admin/delivery-partners/{id}/performance": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Get delivery partner performance metrics", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Performance stats" } } },
      },
      "/api/admin/products/bulk-update": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Bulk update product flags (featured, trending, etc.)", responses: { 200: { description: "Products updated" } } },
      },
      "/api/admin/products/bulk-delete": {
        delete: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Bulk delete products", responses: { 200: { description: "Products deleted" } } },
      },
      "/api/admin/reviews": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "List all reviews (optionally filter flagged)", parameters: [{ in: "query", name: "isFlagged", schema: { type: "boolean" } }], responses: { 200: { description: "Review list" } } },
      },
      "/api/admin/reviews/{id}/hide": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Hide a review", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Review hidden" } } },
      },
      "/api/admin/reviews/{id}/show": {
        patch: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Show a hidden review", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Review visible" } } },
      },
      "/api/admin/reviews/{id}": {
        delete: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Delete a review", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Review deleted" } } },
      },
      "/api/admin/reports/sales": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Sales report grouped by day/month/year", parameters: [{ in: "query", name: "from", schema: { type: "string", format: "date" } }, { in: "query", name: "to", schema: { type: "string", format: "date" } }, { in: "query", name: "groupBy", schema: { type: "string", enum: ["day", "month", "year"] } }], responses: { 200: { description: "Sales data" } } },
      },
      "/api/admin/reports/revenue": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Revenue breakdown by payment method and status", responses: { 200: { description: "Revenue data" } } },
      },
      "/api/admin/reports/inventory": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Inventory report: out-of-stock, low stock, by category", responses: { 200: { description: "Inventory data" } } },
      },
      "/api/admin/reports/customers": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Customer report: top spenders, verified counts", responses: { 200: { description: "Customer data" } } },
      },
      "/api/admin/reports/vendors": {
        get: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Vendor report: top revenue vendors", responses: { 200: { description: "Vendor data" } } },
      },
      "/api/admin/notifications/send": {
        post: { tags: ["Admin"], security: [{ bearerAuth: [] }], summary: "Broadcast notification to users by role or IDs", responses: { 200: { description: "Notifications sent" } } },
      },

      // ─── VENDOR ───────────────────────────────────────────────────────────
      "/api/vendor/dashboard": {
        get: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Vendor dashboard: revenue, orders, low stock, reviews", responses: { 200: { description: "Dashboard data" } } },
      },
      "/api/vendor/products": {
        get: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "List vendor's own products", parameters: [{ in: "query", name: "search", schema: { type: "string" } }, { in: "query", name: "status", schema: { type: "string", enum: ["active", "outofstock", "lowstock"] } }], responses: { 200: { description: "Product list" } } },
        post: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Create a new product", requestBody: { $ref: "#/components/requestBodies/ProductBody" }, responses: { 201: { description: "Product created" } } },
      },
      "/api/vendor/products/{id}": {
        put: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Update own product", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/ProductBody" }, responses: { 200: { description: "Product updated" } } },
        delete: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Delete own product", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Product deleted" } } },
      },
      "/api/vendor/products/{id}/stock": {
        patch: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Update product stock", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { stock: { type: "integer" } } } } } }, responses: { 200: { description: "Stock updated" } } },
      },
      "/api/vendor/products/bulk-stock": {
        patch: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Bulk update stock for multiple products", responses: { 200: { description: "Stock updated" } } },
      },
      "/api/vendor/orders": {
        get: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Orders containing vendor's products", parameters: [{ in: "query", name: "status", schema: { type: "string" } }], responses: { 200: { description: "Order list" } } },
      },
      "/api/vendor/orders/{id}/status": {
        patch: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Update order status (Confirmed → Packed → Shipped)", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/OrderStatusBody" }, responses: { 200: { description: "Status updated" } } },
      },
      "/api/vendor/reviews": {
        get: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Reviews on vendor's products with rating stats", responses: { 200: { description: "Review list" } } },
      },
      "/api/vendor/reviews/{id}/reply": {
        post: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Reply to a customer review", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Reply posted" } } },
      },
      "/api/vendor/analytics": {
        get: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Sales trend and top-selling products", responses: { 200: { description: "Analytics data" } } },
      },
      "/api/vendor/earnings": {
        get: { tags: ["Vendor"], security: [{ bearerAuth: [] }], summary: "Total and monthly earnings breakdown", responses: { 200: { description: "Earnings data" } } },
      },

      // ─── DELIVERY ─────────────────────────────────────────────────────────
      "/api/delivery/dashboard": {
        get: { tags: ["Delivery"], security: [{ bearerAuth: [] }], summary: "Delivery partner dashboard: stats and recent assignments", responses: { 200: { description: "Dashboard data" } } },
      },
      "/api/delivery/my-deliveries": {
        get: { tags: ["Delivery"], security: [{ bearerAuth: [] }], summary: "List assigned deliveries (optionally by status)", parameters: [{ in: "query", name: "status", schema: { type: "string" } }], responses: { 200: { description: "Delivery list" } } },
      },
      "/api/delivery/status/{id}": {
        put: { tags: ["Delivery"], security: [{ bearerAuth: [] }], summary: "Update delivery status (Out For Delivery / Delivered)", parameters: [{ $ref: "#/components/parameters/IdParam" }], requestBody: { $ref: "#/components/requestBodies/OrderStatusBody" }, responses: { 200: { description: "Status updated" } } },
      },
      "/api/delivery/completed": {
        get: { tags: ["Delivery"], security: [{ bearerAuth: [] }], summary: "List completed deliveries", responses: { 200: { description: "Completed deliveries" } } },
      },
      "/api/delivery/earnings": {
        get: { tags: ["Delivery"], security: [{ bearerAuth: [] }], summary: "Total and monthly earnings (₹50/delivery)", responses: { 200: { description: "Earnings data" } } },
      },
      "/api/delivery/profile": {
        patch: { tags: ["Delivery"], security: [{ bearerAuth: [] }], summary: "Update vehicle info and phone", responses: { 200: { description: "Profile updated" } } },
      },
      "/api/delivery/availability": {
        patch: { tags: ["Delivery"], security: [{ bearerAuth: [] }], summary: "Toggle availability status", responses: { 200: { description: "Availability toggled" } } },
      },
      "/api/delivery/assign/{id}": {
        post: { tags: ["Delivery"], security: [{ bearerAuth: [] }], summary: "Assign delivery partner to order (Admin)", parameters: [{ $ref: "#/components/parameters/IdParam" }], responses: { 200: { description: "Partner assigned" } } },
      },
    },
  },

  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
