
import API from "../config/axios";

// Get logged-in user's cart
export const getCart = async () => {
    const response = await API.get("/cart");
    return response.data;
};

// Add product to cart
export const addToCart = async (productId) => {
    const response = await API.post("/cart/add", {
        productId
    });
    return response.data;
};

// Update product quantity
export const updateCartQuantity = async (productId, quantity) => {
    const response = await API.put("/cart/update", {
        productId,
        quantity
    });
    return response.data;
};

// Remove product from cart
export const removeFromCart = async (productId) => {
    const response = await API.delete("/cart/remove", {
        data: { productId }
    });
    return response.data;
};

// Clear cart
export const clearCart = async () => {
    const response = await API.delete("/cart/clear");
    return response.data;
};
