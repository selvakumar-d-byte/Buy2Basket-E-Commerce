import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { getCart, updateCartQuantity, removeFromCart, clearCart } from "../services/cartService";

function Cart() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCartItems([]);
            setError("");

            if (!user) {
                setLoading(false);
                navigate("/login");
                return;
            }

            try {
                setLoading(true);

                const data = await getCart();

                if (active) {
                    setCartItems(data.items || []);
                }
            } catch (err) {
                if (active) {
                    setError(err.response?.data?.message || "Unable to load cart.");
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

    const handleQuantity = async (productId, quantity) => {
        try {
            setActionLoading(productId);

            await updateCartQuantity(productId, quantity);

            const data = await getCart();
            setCartItems(data.items || []);
        } catch (err) {
            setError(err.response?.data?.message || "Quantity update failed.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (productId) => {
        try {
            setActionLoading(productId);

            await removeFromCart(productId);

            setCartItems((previous) =>
                previous.filter(
                    (item) => item.productId?._id !== productId
                )
            );
        } catch (err) {
            setError(err.response?.data?.message || "Unable to remove product.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearCart = async () => {
        try {
            setActionLoading("clear");

            await clearCart();
            setCartItems([]);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to clear cart.");
        } finally {
            setActionLoading(null);
        }
    };

    const total = cartItems.reduce((sum, item) => {
        return sum + (item.productId?.price || 0) * item.quantity;
    }, 0);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">Loading your cart...</div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8 lg:px-20">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">My Shopping Cart</h1>

            {error && (
                <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
            )}

            {cartItems.length === 0 ? (
                <div className="rounded-xl bg-white px-5 py-16 text-center">
                    <i className="fa-solid fa-cart-shopping text-5xl text-gray-300" />
                    <h2 className="mt-5 text-xl font-semibold">Your cart is empty</h2>
                    <p className="mt-2 text-gray-500">Add some products to your cart.</p>
                    <button
                        onClick={() => navigate("/products")}
                        className="mt-6 rounded-lg bg-[#245C45] px-6 py-3 font-semibold text-white hover:bg-[#173B2E]"
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <section className="space-y-4">
                        {cartItems.map((item) => {
                            const product = item.productId;

                            if (!product) return null;

                            return (
                                <article
                                    key={product._id}
                                    className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row"
                                >
                                    <img src={product.image} alt={product.name} className="h-28 w-28 rounded-lg object-cover" />

                                    <div className="flex flex-1 flex-col justify-between gap-3">
                                        <div>
                                            <h2 className="font-semibold text-gray-800">{product.name}</h2>
                                            <p className="mt-1 font-bold text-[#245C45]">₹{Number(product.price).toLocaleString("en-IN")}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                disabled={actionLoading === product._id || item.quantity <= 1}
                                                onClick={() => handleQuantity(product._id, item.quantity - 1)}
                                                className="h-8 w-8 rounded border disabled:opacity-40"
                                            >
                                                -
                                            </button>

                                            <span>{item.quantity}</span>

                                            <button
                                                disabled={actionLoading === product._id || item.quantity >= product.stock}
                                                onClick={() => handleQuantity(product._id, item.quantity + 1)}
                                                className="h-8 w-8 rounded border disabled:opacity-40"
                                            >
                                                +
                                            </button>

                                            <button
                                                disabled={actionLoading === product._id}
                                                onClick={() => handleRemove(product._id)}
                                                className="ml-auto text-sm font-medium text-red-500"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold">Order Summary</h2>

                        <div className="mt-5 flex justify-between border-b pb-4">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold">
                                ₹{total.toLocaleString("en-IN")}
                            </span>
                        </div>

                        <div className="mt-4 flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-[#245C45]">
                                ₹{total.toLocaleString("en-IN")}
                            </span>
                        </div>

                        <button
                            onClick={() => navigate("/checkout")}
                            className="mt-6 w-full rounded-lg bg-[#245C45] py-3 font-semibold text-white hover:bg-[#173B2E]"
                        >
                            Proceed to Checkout
                            <i className="fa-solid fa-arrow-right ml-2" />
                        </button>

                        <button
                            disabled={actionLoading === "clear"}
                            onClick={handleClearCart}
                            className="mt-3 w-full rounded-lg border border-red-200 py-3 text-sm font-semibold text-red-500 disabled:opacity-50"
                        >
                            Clear Cart
                        </button>
                    </aside>
                </div>
            )}
        </main>
    );
}

export default Cart;