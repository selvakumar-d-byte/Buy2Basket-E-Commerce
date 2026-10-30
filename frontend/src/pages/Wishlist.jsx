
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import {
    getWishlist,
    removeFromWishlist
} from "../services/wishlistService";
import { addToCart } from "../services/cartService";

function Wishlist() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setProducts([]);
            setMessage("");

            if (!user) {
                setLoading(false);
                navigate("/login");
                return;
            }

            try {
                setLoading(true);

                const data = await getWishlist();

                if (active) {
                    setProducts(data.productIds || []);
                }
            } catch (error) {
                if (active) {
                    setMessage(
                        error.response?.data?.message || "Unable to load wishlist."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        });

        return () => {
            active = false;
            unsubscribe();
        };
    }, [navigate]);

    const handleRemove = async (productId) => {
        try {
            setActionLoading(productId);

            await removeFromWishlist(productId);

            setProducts((previous) =>
                previous.filter((product) => product._id !== productId)
            );

            setMessage("Product removed from wishlist");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to remove product."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            setActionLoading(productId);

            const response = await addToCart(productId);

            setMessage(response.message || "Product added to cart");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to add product to cart."
            );
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                Loading your wishlist...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8 lg:px-20">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">
                My Wishlist
            </h1>

            {message && (
                <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-[#245C45]">
                    {message}
                </div>
            )}

            {products.length === 0 ? (
                <div className="rounded-xl bg-white px-5 py-16 text-center">
                    <i className="fa-regular fa-heart text-5xl text-gray-300" />
                    <h2 className="mt-5 text-xl font-semibold">
                        Your wishlist is empty
                    </h2>
                    <p className="mt-2 text-gray-500">
                        Save your favourite products here.
                    </p>
                    <button
                        onClick={() => navigate("/products")}
                        className="mt-6 rounded-lg bg-[#245C45] px-6 py-3 font-semibold text-white hover:bg-[#173B2E]"
                    >
                        Explore Products
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                        <article
                            key={product._id}
                            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="aspect-square w-full object-cover"
                            />

                            <div className="p-3 sm:p-4">
                                <p className="text-xs text-gray-500">
                                    {product.brand || product.category}
                                </p>

                                <h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold">
                                    {product.name}
                                </h2>

                                <p className="mt-2 font-bold text-[#245C45]">
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </p>

                                <button
                                    disabled={actionLoading === product._id}
                                    onClick={() => handleAddToCart(product._id)}
                                    className="mt-3 w-full rounded-lg bg-[#245C45] py-2 text-xs font-semibold text-white hover:bg-[#173B2E] disabled:opacity-50"
                                >
                                    Add to Cart
                                </button>

                                <button
                                    disabled={actionLoading === product._id}
                                    onClick={() => handleRemove(product._id)}
                                    className="mt-2 w-full rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-500 disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default Wishlist;
