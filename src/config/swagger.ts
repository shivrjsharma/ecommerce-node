import { OpenAPIV3 } from "openapi-types";

const bearerAuth: OpenAPIV3.SecurityRequirementObject[] = [{ bearerAuth: [] }];
const noAuth: OpenAPIV3.SecurityRequirementObject[] = [];

const idParam = (name = "id"): OpenAPIV3.ParameterObject => ({
  in: "path",
  name,
  required: true,
  schema: { type: "integer" },
  example: 1,
});

const ref = (name: string): OpenAPIV3.ReferenceObject => ({ $ref: `#/components/schemas/${name}` });

const jsonContent = (schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject) => ({
  "application/json": { schema },
});

const errorResponse = (description: string) => ({
  description,
  content: jsonContent(ref("ErrorResponse")),
});

const spec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Express TypeScript API",
    version: "1.0.0",
    description: "User Management API with JWT authentication",
  },
  servers: [{ url: "http://localhost:3000", description: "Development server" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          role: { type: "string", enum: ["user", "admin"], example: "user" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Laptop Pro" },
          category: { type: "string", example: "Electronics" },
          price: { type: "number", example: 999.99 },
          stock: { type: "integer", example: 50 },
          description: { type: "string", example: "High performance laptop" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          quantity: { type: "integer", example: 2 },
          product: ref("Product"),
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          quantity: { type: "integer", example: 2 },
          price: { type: "number", example: 999.99 },
          product: ref("Product"),
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          status: {
            type: "string",
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            example: "pending",
          },
          total: { type: "number", example: 1999.98 },
          items: { type: "array", items: ref("OrderItem") },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          message: { type: "string", example: "Validation failed" },
          errors: { type: "array", items: { type: "string" } },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 400 },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    // ── Health ──────────────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        security: noAuth,
        responses: { 200: { description: "OK", content: jsonContent({ type: "object", properties: { status: { type: "string", example: "OK" } } }) } },
      },
    },
    "/health/echo": {
      post: {
        tags: ["Health"],
        summary: "Echo a message",
        security: noAuth,
        requestBody: {
          required: true,
          content: jsonContent({ type: "object", required: ["message"], properties: { message: { type: "string", minLength: 1, maxLength: 100, example: "hello" } } }),
        },
        responses: {
          200: { description: "Echoed message", content: jsonContent({ type: "object", properties: { echo: { type: "string" } } }) },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
        },
      },
    },

    // ── Auth ─────────────────────────────────────────────────────────────────
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login — returns accessToken (15m) and refreshToken (7d)",
        security: noAuth,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email", example: "john@example.com" },
              password: { type: "string", example: "secret123" },
            },
          }),
        },
        responses: {
          200: {
            description: "Login successful",
            content: jsonContent({
              type: "object",
              properties: {
                accessToken: { type: "string", example: "eyJhbGci..." },
                refreshToken: { type: "string", example: "eyJhbGci..." },
              },
            }),
          },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
          401: errorResponse("Invalid credentials"),
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        security: noAuth,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["refreshToken"],
            properties: { refreshToken: { type: "string", example: "eyJhbGci..." } },
          }),
        },
        responses: {
          200: {
            description: "New access token issued",
            content: jsonContent({ type: "object", properties: { accessToken: { type: "string", example: "eyJhbGci..." } } }),
          },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
          401: errorResponse("Invalid or expired refresh token"),
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout — revokes refresh token",
        security: bearerAuth,
        responses: {
          200: { description: "Logged out", content: jsonContent({ type: "object", properties: { message: { type: "string" } } }) },
          401: errorResponse("Unauthorized"),
        },
      },
    },

    // ── Users ────────────────────────────────────────────────────────────────
    "/users/register": {
      post: {
        tags: ["Users"],
        summary: "Register a new user",
        security: noAuth,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["name", "email", "password"],
            properties: {
              name: { type: "string", minLength: 2, maxLength: 50, example: "John Doe" },
              email: { type: "string", format: "email", example: "john@example.com" },
              password: { type: "string", minLength: 6, example: "secret123" },
            },
          }),
        },
        responses: {
          201: { description: "User registered", content: jsonContent({ type: "object", properties: { message: { type: "string" }, user: ref("UserProfile") } }) },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
          409: errorResponse("Email already registered"),
        },
      },
    },
    "/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Get logged-in user profile",
        security: bearerAuth,
        responses: {
          200: { description: "User profile", content: jsonContent(ref("UserProfile")) },
          401: errorResponse("Unauthorized"),
        },
      },
    },
    "/users/update": {
      put: {
        tags: ["Users"],
        summary: "Update profile",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            minProperties: 1,
            properties: {
              name: { type: "string", minLength: 2, maxLength: 50, example: "Jane Doe" },
              email: { type: "string", format: "email", example: "jane@example.com" },
            },
          }),
        },
        responses: {
          200: { description: "Profile updated", content: jsonContent({ type: "object", properties: { message: { type: "string" }, user: ref("UserProfile") } }) },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
          401: errorResponse("Unauthorized"),
        },
      },
    },
    "/users/change-password": {
      put: {
        tags: ["Users"],
        summary: "Change password",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["oldPassword", "newPassword"],
            properties: {
              oldPassword: { type: "string", example: "secret123" },
              newPassword: { type: "string", minLength: 6, example: "newSecret456" },
            },
          }),
        },
        responses: {
          200: { description: "Password changed", content: jsonContent({ type: "object", properties: { message: { type: "string" } } }) },
          400: { description: "Validation failed or wrong password", content: jsonContent(ref("ErrorResponse")) },
          401: errorResponse("Unauthorized"),
        },
      },
    },

    // ── Products ─────────────────────────────────────────────────────────────
    "/products": {
      get: {
        tags: ["Products"],
        summary: "Get all products (paginated)",
        security: noAuth,
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          200: {
            description: "Paginated product list",
            content: jsonContent({
              type: "object",
              properties: {
                products: { type: "array", items: ref("Product") },
                total: { type: "integer" },
                page: { type: "integer" },
                pages: { type: "integer" },
              },
            }),
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["name", "price"],
            properties: {
              name: { type: "string", minLength: 2, maxLength: 100, example: "Laptop Pro" },
              category: { type: "string", maxLength: 50, example: "Electronics" },
              price: { type: "number", example: 999.99 },
              stock: { type: "integer", example: 50 },
              description: { type: "string", maxLength: 500, example: "High performance laptop" },
            },
          }),
        },
        responses: {
          201: { description: "Product created", content: jsonContent({ type: "object", properties: { message: { type: "string" }, product: ref("Product") } }) },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
          401: errorResponse("Unauthorized"),
        },
      },
    },
    "/products/search": {
      get: {
        tags: ["Products"],
        summary: "Search products by name or category",
        security: noAuth,
        parameters: [{ in: "query", name: "query", required: true, schema: { type: "string" }, example: "laptop" }],
        responses: {
          200: { description: "Matching products", content: jsonContent({ type: "array", items: ref("Product") }) },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        security: noAuth,
        parameters: [idParam()],
        responses: {
          200: { description: "Product details", content: jsonContent(ref("Product")) },
          404: errorResponse("Product not found"),
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update product",
        security: bearerAuth,
        parameters: [idParam()],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            minProperties: 1,
            properties: {
              name: { type: "string", example: "Laptop Pro Max" },
              category: { type: "string", example: "Electronics" },
              price: { type: "number", example: 1199.99 },
              stock: { type: "integer", example: 30 },
              description: { type: "string", example: "Updated description" },
            },
          }),
        },
        responses: {
          200: { description: "Product updated", content: jsonContent({ type: "object", properties: { message: { type: "string" }, product: ref("Product") } }) },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
          401: errorResponse("Unauthorized"),
          404: errorResponse("Product not found"),
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product",
        security: bearerAuth,
        parameters: [idParam()],
        responses: {
          200: { description: "Product deleted", content: jsonContent({ type: "object", properties: { message: { type: "string" } } }) },
          401: errorResponse("Unauthorized"),
          404: errorResponse("Product not found"),
        },
      },
    },

    // ── Cart ─────────────────────────────────────────────────────────────────
    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get user cart",
        security: bearerAuth,
        responses: {
          200: {
            description: "Cart items and total",
            content: jsonContent({
              type: "object",
              properties: {
                items: { type: "array", items: ref("CartItem") },
                total: { type: "number", example: 1999.98 },
              },
            }),
          },
          401: errorResponse("Unauthorized"),
        },
      },
    },
    "/cart/add": {
      post: {
        tags: ["Cart"],
        summary: "Add item to cart",
        security: bearerAuth,
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["productId"],
            properties: {
              productId: { type: "integer", example: 1 },
              quantity: { type: "integer", minimum: 1, default: 1, example: 2 },
            },
          }),
        },
        responses: {
          201: { description: "Item added", content: jsonContent({ type: "object", properties: { message: { type: "string" }, item: ref("CartItem") } }) },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
          401: errorResponse("Unauthorized"),
          404: errorResponse("Product not found"),
        },
      },
    },
    "/cart/clear": {
      delete: {
        tags: ["Cart"],
        summary: "Clear entire cart",
        security: bearerAuth,
        responses: {
          200: { description: "Cart cleared", content: jsonContent({ type: "object", properties: { message: { type: "string" } } }) },
          401: errorResponse("Unauthorized"),
        },
      },
    },
    "/cart/update/{itemId}": {
      put: {
        tags: ["Cart"],
        summary: "Update cart item quantity",
        security: bearerAuth,
        parameters: [idParam("itemId")],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["quantity"],
            properties: { quantity: { type: "integer", minimum: 0, example: 3 } },
          }),
        },
        responses: {
          200: { description: "Cart item updated", content: jsonContent({ type: "object", properties: { message: { type: "string" }, item: ref("CartItem") } }) },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
          401: errorResponse("Unauthorized"),
          404: errorResponse("Cart item not found"),
        },
      },
    },
    "/cart/remove/{itemId}": {
      delete: {
        tags: ["Cart"],
        summary: "Remove cart item",
        security: bearerAuth,
        parameters: [idParam("itemId")],
        responses: {
          200: { description: "Item removed", content: jsonContent({ type: "object", properties: { message: { type: "string" } } }) },
          401: errorResponse("Unauthorized"),
          404: errorResponse("Cart item not found"),
        },
      },
    },

    // ── Orders ───────────────────────────────────────────────────────────────
    "/orders": {
      post: {
        tags: ["Orders"],
        summary: "Create order from cart",
        security: bearerAuth,
        responses: {
          201: { description: "Order created", content: jsonContent({ type: "object", properties: { message: { type: "string" }, order: ref("Order") } }) },
          400: errorResponse("Cart is empty"),
          401: errorResponse("Unauthorized"),
        },
      },
      get: {
        tags: ["Orders"],
        summary: "Get all orders for logged-in user",
        security: bearerAuth,
        responses: {
          200: { description: "List of orders", content: jsonContent({ type: "array", items: ref("Order") }) },
          401: errorResponse("Unauthorized"),
        },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order by ID",
        security: bearerAuth,
        parameters: [idParam()],
        responses: {
          200: { description: "Order details", content: jsonContent(ref("Order")) },
          401: errorResponse("Unauthorized"),
          404: errorResponse("Order not found"),
        },
      },
    },
    "/orders/{id}/status": {
      put: {
        tags: ["Orders"],
        summary: "Update order status",
        security: bearerAuth,
        parameters: [idParam()],
        requestBody: {
          required: true,
          content: jsonContent({
            type: "object",
            required: ["status"],
            properties: {
              status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"], example: "shipped" },
            },
          }),
        },
        responses: {
          200: { description: "Status updated", content: jsonContent({ type: "object", properties: { message: { type: "string" }, order: ref("Order") } }) },
          400: { description: "Validation failed", content: jsonContent(ref("ValidationError")) },
          401: errorResponse("Unauthorized"),
          404: errorResponse("Order not found"),
        },
      },
    },
    "/orders/{id}/cancel": {
      delete: {
        tags: ["Orders"],
        summary: "Cancel order",
        security: bearerAuth,
        parameters: [idParam()],
        responses: {
          200: { description: "Order cancelled", content: jsonContent({ type: "object", properties: { message: { type: "string" }, order: ref("Order") } }) },
          400: errorResponse("Cannot cancel after shipping"),
          401: errorResponse("Unauthorized"),
          404: errorResponse("Order not found"),
        },
      },
    },
  },
};

export const swaggerSpec = spec;
