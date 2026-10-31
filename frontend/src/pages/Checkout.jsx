
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

    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    // Load logged-in user and cart
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

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => {
        return sum +
            (item.productId?.price || 0) * item.quantity;
    }, 0);

    // Address input handler
    const handleChange = (e) => {
        const { name, value } = e.target;

        setAddress((previous) => ({
            ...previous,
            [name]: value
        }));
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

    // Card payment test flow
    const handleCardPayment = async () => {
        const cleanCardNumber = cardNumber.replace(/\s/g, "");

        if (!/^\d{16}$/.test(cleanCardNumber)) {
            throw new Error("Please enter a valid 16-digit card number.");
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
            throw new Error("Please enter expiry date in MM/YY format.");
        }

        const [month, year] = expiryDate.split("/").map(Number);

        const expiry = new Date(2000 + year, month);
        const currentMonth = new Date(
            new Date().getFullYear(),
            new Date().getMonth()
        );

        if (expiry <= currentMonth) {
            throw new Error("Your card has expired.");
        }

        if (!/^\d{3}$/.test(cvv)) {
            throw new Error("Please enter a valid 3-digit CVV.");
        }

        // Only address is sent. Card details are not transmitted.
        const response = await API.post(
            "/payments/demo-success",
            address
        );

        alert(response.data.message || "Test payment successful!");

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
            } else if (paymentMethod === "Card") {
                await handleCardPayment();
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
                            <label
                                className={`block cursor-pointer rounded-lg border p-4 ${
                                    paymentMethod === "COD"
                                        ? "border-[#245C45] bg-green-50"
                                        : "border-gray-300"
                                }`}
                            >
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

                            {/* Card Payment */}
                            <label
                                className={`block cursor-pointer rounded-lg border p-4 ${
                                    paymentMethod === "Card"
                                        ? "border-[#245C45] bg-green-50"
                                        : "border-gray-300"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Card"
                                        checked={paymentMethod === "Card"}
                                        onChange={(e) =>
                                            setPaymentMethod(e.target.value)
                                        }
                                        className="accent-[#245C45]"
                                    />

                                    <span className="font-semibold text-gray-800">
                                        Card Payment
                                    </span>
                                </div>

                                <p className="ml-6 mt-2 text-sm text-gray-500">
                                    Test mode — no real payment will be processed.
                                </p>
                            </label>

                            {/* Card Details */}
                            {paymentMethod === "Card" && (
                                <div className="mt-5 space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-5">

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Card Number
                                        </label>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={16}
                                            value={cardNumber}
                                            onChange={(e) =>
                                                setCardNumber(
                                                    e.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 16)
                                                )
                                            }
                                            placeholder="1234567890123456"
                                            required
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#245C45]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Expiry Date
                                            </label>

                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={5}
                                                value={expiryDate}
                                                onChange={(e) => {
                                                    let value = e.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 4);

                                                    if (value.length > 2) {
                                                        value =
                                                            value.slice(0, 2) +
                                                            "/" +
                                                            value.slice(2);
                                                    }

                                                    setExpiryDate(value);
                                                }}
                                                placeholder="MM/YY"
                                                required
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#245C45]"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                CVV
                                            </label>

                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={3}
                                                value={cvv}
                                                onChange={(e) =>
                                                    setCvv(
                                                        e.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 3)
                                                    )
                                                }
                                                placeholder="123"
                                                required
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#245C45]"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-orange-600">
                                        Test mode only. Do not enter real card details.
                                        No actual transaction will take place.
                                    </p>

                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={placingOrder || cartItems.length === 0}
                        className="mt-8 w-full rounded-lg bg-[#245C45] py-3 font-semibold text-white hover:bg-[#173B2E] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {placingOrder
                            ? "Processing..."
                            : paymentMethod === "COD"
                                ? "Place Order"
                                : "Complete Payment"
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
