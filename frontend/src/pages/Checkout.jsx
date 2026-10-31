
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import API from "../config/axios";
import { getCart } from "../services/cartService";

function Checkout() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [demoCardNumber, setDemoCardNumber] = useState("");

    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    useEffect(() => {
        let active = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/login");
                return;
            }

            setAddress((previous) => ({
                ...previous,
                fullName: user.displayName || "",
                email: user.email || ""
            }));

            try {
                const data = await getCart();

                if (!active) return;

                const items = data.items || [];
                setCartItems(items);

                if (items.length === 0) {
                    navigate("/cart");
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load cart."
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

    const subtotal = cartItems.reduce((sum, item) => {
        return sum +
            (item.productId?.price || 0) * item.quantity;
    }, 0);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAddress((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Load Razorpay Checkout script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");

            script.src = "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    // Cash on Delivery
    const handleCODOrder = async () => {
        const response = await API.post(
            "/orders/place",
            address
        );

        alert(response.data.message || "Order placed successfully!");

        navigate("/my-orders");
    };

    // Demo Card Payment - No real transaction
    const handleDemoPayment = async () => {
        const cardNumber = demoCardNumber.replace(/\s/g, "");

        if (!/^\d{16}$/.test(cardNumber)) {
            throw new Error("Please enter exactly 16 digits.");
        }

        const response = await API.post(
            "/payments/demo-success",
            address
        );

        alert(response.data.message || "Demo payment successful!");

        navigate("/my-orders");
    };

    // Form submission
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setPlacingOrder(true);

            if (paymentMethod === "COD") {
                await handleCODOrder();
            } else if (paymentMethod === "Demo") {
                await handleDemoPayment();
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to place your order. Please try again."
            );

            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                Loading checkout...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8 lg:px-20">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">
                Checkout
            </h1>

            {error && (
                <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

                {/* Delivery Address */}
                <form
                    onSubmit={handlePlaceOrder}
                    className="rounded-xl bg-white p-5 shadow-sm sm:p-8"
                >
                    <h2 className="mb-6 text-xl font-bold text-gray-800">
                        Delivery Address
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-2">

                        {[
                            {
                                name: "fullName",
                                label: "Full Name",
                                placeholder: "Enter your full name"
                            },
                            {
                                name: "phone",
                                label: "Phone Number",
                                placeholder: "Enter phone number"
                            },
                            {
                                name: "email",
                                label: "Email Address",
                                placeholder: "Enter email address"
                            },
                            {
                                name: "pincode",
                                label: "PIN Code",
                                placeholder: "Enter PIN code"
                            },
                            {
                                name: "city",
                                label: "City",
                                placeholder: "Enter city"
                            },
                            {
                                name: "state",
                                label: "State",
                                placeholder: "Enter state"
                            }
                        ].map((field) => (
                            <div key={field.name}>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    {field.label}
                                </label>

                                <input
                                    type="text"
                                    name={field.name}
                                    value={address[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#245C45]"
                                />
                            </div>
                        ))}

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Address
                            </label>

                            <textarea
                                name="address"
                                value={address.address}
                                onChange={handleChange}
                                placeholder="House number, street, area and landmark"
                                rows="4"
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#245C45]"
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mt-8">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">
                            Payment Method
                        </h2>

                        <div className="space-y-4">

                            {/* COD */}
                            <label className={`block cursor-pointer rounded-lg border p-4 ${paymentMethod === "COD"
                                ? "border-[#245C45] bg-green-50"
                                : "border-gray-300"
                                }`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === "COD"}
                                        onChange={(e) =>
                                            setPaymentMethod(e.target.value)
                                        }
                                        className="accent-[#245C45]"
                                    />

                                    <span className="font-semibold text-gray-800">
                                        Cash on Delivery (COD)
                                    </span>
                                </div>

                                <p className="ml-6 mt-2 text-sm text-gray-500">
                                    Pay when your order is delivered.
                                </p>
                            </label>

                            {/* Demo Card Payment */}
                            <label className={`block cursor-pointer rounded-lg border p-4 ${paymentMethod === "Demo"
                                ? "border-[#245C45] bg-green-50"
                                : "border-gray-300"
                                }`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Demo"
                                        checked={paymentMethod === "Demo"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="accent-[#245C45]"
                                    />

                                    <span className="font-semibold text-gray-800">
                                        Demo Card Payment
                                    </span>
                                </div>

                                <p className="ml-6 mt-2 text-sm text-gray-500">
                                    For project demonstration only. No real payment.
                                </p>
                            </label>

                            {paymentMethod === "Demo" && (
                                <div className="mt-5">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Demo Card Number
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={16}
                                        value={demoCardNumber}
                                        onChange={(e) =>
                                            setDemoCardNumber(
                                                e.target.value.replace(/\D/g, "").slice(0, 16)
                                            )
                                        }
                                        placeholder="Enter 16-digit demo card number"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#245C45]"
                                    />

                                    <p className="mt-2 text-xs text-orange-600">
                                        Demo only — no card details are stored and no real transaction occurs.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={placingOrder || cartItems.length === 0}
                        className="mt-8 w-full rounded-lg bg-[#245C45] py-3 font-semibold text-white hover:bg-[#173B2E] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {placingOrder
                            ? "Processing..."
                            : paymentMethod === "COD"
                                ? "Place Order"
                                : "Complete Demo Payment"
                        }
                    </button>
                </form>

                {/* Order Summary */}
                <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800">
                        Order Summary
                    </h2>

                    <div className="mt-5 space-y-4">
                        {cartItems.map((item) => {
                            const product = item.productId;

                            if (!product) return null;

                            return (
                                <div
                                    key={product._id}
                                    className="flex items-center gap-3"
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-gray-800">
                                            {product.name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>

                                    <p className="font-semibold">
                                        ₹{(
                                            product.price * item.quantity
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 space-y-3 border-t pt-5">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>
                                ₹{subtotal.toLocaleString("en-IN")}
                            </span>
                        </div>

                        <div className="flex justify-between text-gray-500">
                            <span>Delivery</span>
                            <span className="text-green-600">
                                Free
                            </span>
                        </div>

                        <div className="flex justify-between border-t pt-4 text-lg font-bold">
                            <span>Total</span>
                            <span className="text-[#245C45]">
                                ₹{subtotal.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}

export default Checkout;
