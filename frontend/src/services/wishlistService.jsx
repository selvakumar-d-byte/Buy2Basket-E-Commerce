
import API from "../config/axios";

// Get logged-in user's wishlist
export const getWishlist = async () => {
    const response = await API.get("/wishlist");
    return response.data;
};

// Add product to wishlist
export const addToWishlist = async (productId) => {
    const response = await API.post("/wishlist/add", {
        productId
    });
    return response.data;
};

// Remove product from wishlist
export const removeFromWishlist = async (productId) => {
    const response = await API.delete("/wishlist/remove", {
        data: { productId }
    });
    return response.data;
};
