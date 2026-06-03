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

    // 🔐 REQUIRED
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;