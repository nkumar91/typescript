import express from "express";
import * as cartController from "../controller/cart.controller";
import { requireAuth } from "../middleware/auth";

const cartRouter = express.Router();

/**
 * POST /api/cart/add
 * Add item to cart
 */
cartRouter.post("/add", requireAuth, cartController.addToCart);

/**
 * GET /api/cart/:userId
 * Get all cart items for a user
 */
cartRouter.get("/:userId", requireAuth, cartController.getCartItems);

/**
 * GET /api/cart/count/:userId
 * Get cart item count for a user
 */
cartRouter.get("/count/:userId", requireAuth, cartController.getCartCount);

/**
 * PUT /api/cart/:id
 * Update cart item quantity
 */
cartRouter.put("/:id", requireAuth, cartController.updateCartItem);

/**
 * DELETE /api/cart/:id
 * Remove item from cart
 */
cartRouter.delete("/:id", requireAuth, cartController.removeFromCart);

/**
 * DELETE /api/cart/clear/:userId
 * Clear entire cart for a user
 */
cartRouter.delete("/clear/:userId", requireAuth, cartController.clearCart);

export default cartRouter;
