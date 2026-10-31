
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import API from "../config/axios";

function MyOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/login");
                return;
            }

            try {
                setLoading(true);

                const response = await API.get("/orders/my-orders");

                if (active) {
                    setOrders(response.data.orders || []);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load your orders."
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

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                Loading your orders...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8 lg:px-20">

            <h1 className="mb-8 text-3xl font-bold text-gray-900">
                My Orders
            </h1>

            {error && (
                <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            {orders.length === 0 && !error ? (
                <div className="rounded-xl bg-white px-5 py-16 text-center shadow-sm">
                    <i className="fa-solid fa-box-open text-5xl text-gray-300" />

                    <h2 className="mt-5 text-xl font-semibold text-gray-800">
                        No orders yet
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Your purchased products will appear here.
                    </p>

                    <button
                        onClick={() => navigate("/products")}
                        className="mt-6 rounded-lg bg-[#245C45] px-6 py-3 font-semibold text-white hover:bg-[#173B2E]"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="space-y-6">

                    {orders.map((order) => (
                        <article
                            key={order._id}
                            className="rounded-xl bg-white p-5 shadow-sm sm:p-6"
                        >

                            <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Order ID
                                    </p>

                                    <p className="break-all font-semibold text-gray-800">
                                        {order._id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Order Date
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </p>
                                </div>

                            </div>

                            <div className="my-5 space-y-4">

                                {order.items.map((item, index) => (
                                    <div
                                        key={item.productId || index}
                                        className="flex items-center gap-4"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-20 w-20 rounded-lg object-cover"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-800">
                                                {item.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Quantity: {item.quantity}
                                            </p>

                                            <p className="mt-1 font-semibold text-[#245C45]">
                                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                            </div>

                            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex flex-wrap gap-3">

                                    <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                                        {order.orderStatus}
                                    </span>

                                    <span className="rounded-full bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
                                        Payment: {order.paymentStatus}
                                    </span>

                                    <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                                        {order.paymentMethod}
                                    </span>

                                </div>

                                <div className="text-lg font-bold text-gray-900">
                                    Total:{" "}
                                    <span className="text-[#245C45]">
                                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                                    </span>
                                </div>

                            </div>

                            <div className="mt-5 rounded-lg bg-gray-50 p-4">
                                <h3 className="mb-2 font-semibold text-gray-800">
                                    Delivery Address
                                </h3>

                                <p className="text-sm leading-6 text-gray-600">
                                    {order.deliveryAddress.fullName}<br />
                                    {order.deliveryAddress.phone}<br />
                                    {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                                </p>
                            </div>

                        </article>
                    ))}

                </div>
            )}

        </main>
    );
}

export default MyOrders;
