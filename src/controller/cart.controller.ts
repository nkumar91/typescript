import { Response, NextFunction } from "express";
import { Cart } from "../model/cart.model";
import { Product } from "../model/product.model";
import { User } from "../model/user.model";
import { RequestWithUser } from "../middleware/auth";

/**
 * Add item to cart or update quantity if already exists
 */
export const addToCart = async (
    req: RequestWithUser,
    res: Response
): Promise<any> => {
    try {
        const { productId, quantity } = req.body;

        const userId = req.user?.id;

        // Validation
        if (!userId || !productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "userId, productId, and quantity are required",
            });

        }

        if (quantity < 1) {
            return res
                .status(400)
                .json({ success: false, message: "Quantity must be at least 1" });
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }

        // Check if item already in cart
        let cartItem = await Cart.findOne({
            where: { userId, productId },
            raw: true,
        });

        if (cartItem) {

            // Update quantity - increment by 1
            await Cart.update({ quantity: cartItem.quantity + 1 }, { where: { id: cartItem.id } });
        } else {
            // Create new cart item with quantity of 1
            cartItem = await Cart.create({
                userId,
                productId,
                quantity: 1,
            });
        }

        // Fetch updated cart item with product details
        const updatedCartItem = await Cart.findByPk(cartItem.id, {
            include: [{ model: Product, as: "product", required: true }],
        });

        res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            data: updatedCartItem,
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get all cart items for a user
 */
export const getCartItems = async (
    req: RequestWithUser,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res
                .status(400)
                .json({ success: false, message: "User ID is required" });
            return;
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        
        // const cartItems = await Cart.findAndCountAll({
        //     attributes: ['id', 'quantity', 'createdAt', 'updatedAt'],
        //     where: { userId },
        //     include: [{ model: Product, as: "product", required: true, attributes: ['id', 'productName', 'productPrice', 'productImage'] }],
        // });

        const cartItems = await Cart.findAll({
            attributes:['id','quantity','createdAt','updatedAt'],
            where: { userId },
            include: [{ model: Product, as: "product",required: true ,attributes:['id','productName','productPrice','productImage']}],
        });

        // Calculate cart total
         // const cartJson = cartItems.map(item => item.toJSON());
        const cartJson = cartItems.map(item => item.get({ plain: true }));
        let cartTotal = 0;
        const itemsWithTotal = cartJson.map((item: any) => {
            const itemTotal = Number(item.product.productPrice) * item.quantity;
            cartTotal += itemTotal;
            return {
                ...item,
                totalPrice: itemTotal,
            };
        });

        res.status(200).json({
            success: true,
            message: "Cart items retrieved successfully",
            cartTotal,
            itemCount: cartItems.length,
            data:itemsWithTotal, 
        });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
    req: RequestWithUser,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Cart item ID is required" });
            ;
        }

        if (!action || !["increment", "decrement"].includes(action)) {
            return res
                .status(400)
                .json({ success: false, message: "Action must be 'increment' or 'decrement'" });
            ;
        }

        const cartItem = await Cart.findByPk(id);

        if (!cartItem) {
            return res
                .status(404)
                .json({ success: false, message: "Cart item not found" });
            ;
        }

        const newQuantity = action === "increment" ? cartItem.quantity + 1 : cartItem.quantity - 1;

        if (newQuantity < 1) {
            return res
                .status(400)
                .json({ success: false, message: "Quantity must be at least 1" });
            ;
        }

        await Cart.update({ quantity: newQuantity }, { where: { id } });

        // Fetch updated item with product details
        const updatedCartItem = await Cart.findByPk(id, {
            include: [{ model: Product, as: "product" }],
        });

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: updatedCartItem,
        });
    } catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (
    req: RequestWithUser,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ success: false, message: "Cart item ID is required" });
            return;
        }

        const cartItem = await Cart.findByPk(id);

        if (!cartItem) {
            res
                .status(404)
                .json({ success: false, message: "Cart item not found" });
            return;
        }

        await Cart.destroy({ where: { id } });

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Clear entire cart for a user
 */
export const clearCart = async (
    req: RequestWithUser,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res
                .status(400)
                .json({ success: false, message: "User ID is required" });
            return;
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        const deletedCount = await Cart.destroy({
            where: { userId },
        });

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: { deletedCount },
        });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

/**
 * Get cart item count for a user
 */
export const getCartCount = async (
    req: RequestWithUser,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res
                .status(400)
                .json({ success: false, message: "User ID is required" });
            return;
        }

        const count = await Cart.count({
            where: { userId },
        });

        res.status(200).json({
            success: true,
            message: "Cart count retrieved successfully",
            data: { count },
        });
    } catch (error) {
        console.error("Error fetching cart count:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
