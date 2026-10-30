
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import API from "../config/axios";
import {addToCart,updateCartQuantity} from "../services/cartService";
import {getWishlist,addToWishlist,removeFromWishlist} from "../services/wishlistService";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [wishlist, setWishlist] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                const response = await API.get("/products");
                const productList = Array.isArray(response.data)? response.data: response.data.products || [];
                const selectedProduct = productList.find((item) => item._id === id);

                setProduct(selectedProduct || null);
            } catch (error) {
                console.error("Product loading error:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setWishlist(false);
            if (!user) return;

            try {
                const data = await getWishlist();

                const wishlistIds = (data.productIds || []).map((item) =>
                    typeof item === "string" ? item : item._id
                );

                setWishlist(wishlistIds.includes(id));
            } catch (error) {
                console.error("Wishlist loading error:", error);
            }
        });

        return () => unsubscribe();
    }, [id]);

    const handleAddToCart = async () => {
        if (!auth.currentUser) {
            navigate("/login");
            return;
        }

        try {
            setActionLoading(true);
            setMessage("");

            await addToCart(product._id);
            if (quantity > 1) {
                await updateCartQuantity(product._id, quantity);
            }
            setMessage("Product added to your cart successfully!");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to add product to cart."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleWishlist = async () => {
        if (!auth.currentUser) {
            navigate("/login");
            return;
        }

        try {
            setActionLoading(true);
            setMessage("");

            if (wishlist) {
                await removeFromWishlist(product._id);
                setWishlist(false);
                setMessage("Removed from your wishlist.");
            } else {
                await addToWishlist(product._id);
                setWishlist(true);
                setMessage("Added to your wishlist!");
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Wishlist update failed."
            );
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
                Loading product details...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <i className="fa-solid fa-box-open text-5xl text-gray-300" />
                <h2 className="mt-5 text-2xl font-bold text-gray-800">
                    Product Not Found
                </h2>
                <p className="mt-2 text-gray-500">
                    This product may have been removed or is unavailable.
                </p>
                <button
                    onClick={() => navigate("/products")}
                    className="mt-6 rounded-lg bg-[#245C45] px-6 py-3 font-semibold text-white hover:bg-[#173B2E]"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    const discount = product.originalPrice > product.price
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
        : product.discount || 0;

    const outOfStock = product.stock <= 0;

    return (
        <main className="min-h-screen bg-white px-4 py-8 sm:px-8 lg:px-20">
            <section className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">

                <div className="flex items-center justify-center rounded-xl bg-gray-50 p-5 sm:p-8">
                    <img src={product.image} alt={product.name} className="max-h-[480px] w-full object-contain"/>
                </div>

                <div className="flex flex-col">

                    <p className="text-sm font-semibold uppercase tracking-wide text-[#245C45]">{product.brand || "Buy2Basket"} </p>

                    <h1 className="mt-2 text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">{product.name}</h1>

                    <div className="mt-4 flex items-center gap-2">
                        <span className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-sm font-semibold text-[#245C45]">
                            {product.rating || 4}
                            <i className="fa-solid fa-star text-xs" />
                        </span>
                        <span className="text-sm text-gray-500">Customer rating</span>
                    </div>

                    <div className="mt-6 border-b border-gray-200 pb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-3xl font-bold text-gray-900">
                                ₹{Number(product.price).toLocaleString("en-IN")}
                            </span>

                            {product.originalPrice > product.price && (
                                <span className="text-lg text-gray-400 line-through">
                                    ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                                </span>
                            )}

                            {discount > 0 && (
                                <span className="rounded bg-green-50 px-2 py-1 text-sm font-semibold text-green-700">
                                    {discount}% OFF
                                </span>
                            )}
                        </div>

                        <p className="mt-2 text-sm text-gray-500"> Inclusive of applicable taxes</p>
                    </div>

                    {/* Quantity */}
                    {!outOfStock && (
                        <div className="mt-6">
                            <p className="mb-3 text-sm font-semibold text-gray-700">Quantity</p>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
                                    <button
                                        onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
                                        disabled={quantity <= 1}
                                        className="h-10 w-10 text-lg disabled:opacity-40"
                                    >
                                        -
                                    </button>

                                    <span className="w-12 text-center font-semibold">{quantity}</span>

                                    <button
                                        onClick={() =>setQuantity((previous) =>Math.min(product.stock, previous + 1))}
                                        disabled={quantity >= product.stock}
                                        className="h-10 w-10 text-lg disabled:opacity-40"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={handleAddToCart}
                            disabled={outOfStock || actionLoading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#245C45] px-5 py-3.5 font-semibold text-white transition hover:bg-[#173B2E] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <i className="fa-solid fa-cart-shopping" />
                            {actionLoading ? "Please wait..." : "Add to Cart"}
                        </button>

                        <button
                            onClick={handleWishlist}
                            disabled={actionLoading}
                            className="flex items-center justify-center gap-2 rounded-lg border border-[#245C45] px-5 py-3.5 font-semibold text-[#245C45] transition hover:bg-green-50 disabled:opacity-50"
                        >
                            <i className={`${wishlist ? "fa-solid" : "fa-regular"} fa-heart`} />
                            Wishlist
                        </button>
                    </div>

                    {message && (
                        <p className="mt-4 text-sm text-[#245C45]">{message}</p>
                    )}

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-bold text-gray-900">Product Description</h2>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">{product.description || "No description available for this product."}</p>
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-bold text-gray-900">Product Information</h2>

                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Category</span>
                                <span className="font-medium text-gray-800">
                                    {product.category}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">Brand</span>
                                <span className="font-medium text-gray-800">
                                    {product.brand || "Buy2Basket"}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}

export default ProductDetails;
