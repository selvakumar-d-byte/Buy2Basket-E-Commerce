import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/wishlistService";
import { addToCart } from "../services/cartService";

const categories = [
    "All Categories",
    "Fashion",
    "Electronics",
    "Home",
    "Beauty",
    "Sports",
    "Kitchen",
    "Toys & Games",
    "Watches",
    "Bags",
    "Books",
    "Footwear",
];

function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [sort, setSort] = useState("featured");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(true);
    const [cartLoading, setCartLoading] = useState(null);
    const [wishlistActionLoading, setWishlistActionLoading] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function fetchProducts() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/products`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Unable to load products.");
                }

                const data = await response.json();

                setProducts(Array.isArray(data) ? data : data.products || []);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(
                        "Products load aagala. Backend server and API route check pannunga."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchProducts();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setWishlist([]);
                setWishlistLoading(false);
                return;
            }

            try {
                setWishlistLoading(true);

                const data = await getWishlist();

                const wishlistIds = (data.productIds || []).map((product) =>
                    typeof product === "string" ? product : product._id
                );

                setWishlist(wishlistIds);
            } catch (error) {
                console.error("Wishlist loading error:", error);
                setWishlist([]);
            } finally {
                setWishlistLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (category !== "All Categories") {
            result = result.filter(
                (product) => product.category === category
            );
        }

        if (search.trim()) {
            const keyword = search.toLowerCase();

            result = result.filter((product) =>
                [
                    product.name,
                    product.brand,
                    product.category,
                    product.description,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        value.toLowerCase().includes(keyword)
                    )
            );
        }

        if (sort === "price-low") {
            result.sort((a, b) => a.price - b.price);
        } else if (sort === "price-high") {
            result.sort((a, b) => b.price - a.price);
        } else if (sort === "rating") {
            result.sort((a, b) => b.rating - a.rating);
        }

        return result;
    }, [products, category, search, sort]);

    const toggleWishlist = async (id) => {
        const user = auth.currentUser;

        if (!user) {
            navigate("/login");
            return;
        }

        try {
            setWishlistActionLoading(id);

            if (wishlist.includes(id)) {
                await removeFromWishlist(id);

                setWishlist((previous) =>
                    previous.filter((item) => item !== id)
                );

                setMessage("Product removed from wishlist");
            } else {
                await addToWishlist(id);

                setWishlist((previous) =>
                    previous.includes(id) ? previous : [...previous, id]
                );

                setMessage("Product added to wishlist");
            }
        } catch (error) {
            console.error("Wishlist error:", error);
            setMessage(
                error.response?.data?.message || "Wishlist update failed"
            );
        } finally {
            setWishlistActionLoading(null);
        }
    };

    const handleAddToCart = async (id) => {
        const user = auth.currentUser;

        if (!user) {
            navigate("/login");
            return;
        }

        try {
            setCartLoading(id);

            const response = await addToCart(id);

            setMessage(response.message || "Product added to cart");
        } catch (error) {
            console.error("Add to cart error:", error);

            setMessage(
                error.response?.data?.message || "Unable to add product to cart"
            );
        } finally {
            setCartLoading(null);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="bg-[#245C45] px-4 py-10 text-white sm:px-8 lg:px-20">
                <h1 className="text-3xl font-bold sm:text-4xl">Explore Our Products</h1>
            </section>

            <section className="px-4 py-8 sm:px-8 lg:px-20">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, brands..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-[#245C45] focus:ring-2 focus:ring-green-100"
                        />
                    </div>

                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#245C45]">
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>

                {message && (
                    <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-[#245C45]">
                        {message}
                        <button
                            onClick={() => setMessage("")}
                            className="float-right font-bold"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[230px_1fr]">
                    <aside>
                        <h2 className="mb-4 text-lg font-bold text-gray-900">Categories</h2>

                        <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
                            {categories.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setCategory(item)}
                                    className={`shrink-0 rounded-lg px-4 py-3 text-left text-sm transition ${category === item
                                        ? "bg-[#245C45] font-semibold text-white"
                                        : "bg-white text-gray-600 hover:bg-green-50 hover:text-[#245C45]"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Products section */}
                    <div>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {category === "All Categories"
                                        ? "All Products"
                                        : category}
                                </h2>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                                {[1, 2, 3, 4, 5, 6, 8].map((item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse rounded-xl bg-white p-3"
                                    >
                                        <div className="aspect-square rounded-lg bg-gray-200" />
                                        <div className="mt-4 h-4 rounded bg-gray-200" />
                                        <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="rounded-xl bg-white px-5 py-12 text-center">
                                <i className="fa-solid fa-triangle-exclamation text-3xl text-orange-500" />
                                <p className="mt-4 text-gray-700">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 rounded-lg bg-[#245C45] px-5 py-2 text-white"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="rounded-xl bg-white px-5 py-16 text-center">
                                <i className="fa-solid fa-box-open text-4xl text-gray-300" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-800">
                                    No products found
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Try another search or category.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setCategory("All Categories");
                                    }}
                                    className="mt-4 font-semibold text-[#245C45] underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredProducts.map((product) => {
                                    const id = product._id || product.id;
                                    const discount =
                                        product.discount ??
                                        (product.originalPrice > product.price
                                            ? Math.round(
                                                ((product.originalPrice - product.price) /
                                                    product.originalPrice) *
                                                100
                                            )
                                            : 0);

                                    return (
                                        <article
                                            key={id}
                                            className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            {/* Product image */}
                                            <div className="relative overflow-hidden bg-gray-100">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    onClick={() => navigate(`/products/${product._id}`)}
                                                    loading="lazy"
                                                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.style.visibility = "hidden";
                                                    }}
                                                />

                                                {discount > 0 && (
                                                    <span className="absolute left-2 top-2 rounded-md bg-[#245C45] px-2 py-1 text-xs font-semibold text-white">
                                                        {discount}% OFF
                                                    </span>
                                                )}

                                                <button
                                                    onClick={() => toggleWishlist(id)}
                                                    disabled={wishlistActionLoading === id || wishlistLoading}
                                                    aria-label="Toggle wishlist"
                                                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110 disabled:opacity-50"
                                                >
                                                    <i
                                                        className={`fa-heart ${wishlist.includes(id)
                                                            ? "fa-solid text-red-500"
                                                            : "fa-regular text-gray-600"
                                                            }`}
                                                    />
                                                </button>
                                            </div>

                                            {/* Product details */}
                                            <div className="p-3 sm:p-4">
                                                <p className="mb-1 truncate text-xs text-gray-500">
                                                    {product.brand || product.category}
                                                </p>

                                                <h3
                                                    title={product.name}
                                                    className="line-clamp-2 min-h-10 text-sm font-semibold text-gray-800"
                                                >
                                                    {product.name}
                                                </h3>

                                                <div className="mt-2 flex items-center gap-1 text-xs">
                                                    <i className="fa-solid fa-star text-amber-400" />
                                                    <span className="font-medium text-gray-700">
                                                        {Number(product.rating || 0).toFixed(1)}
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <span className="text-base font-bold text-[#245C45]">
                                                        ₹{Number(product.price).toLocaleString("en-IN")}
                                                    </span>

                                                    {product.originalPrice > product.price && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handleAddToCart(id)}
                                                    disabled={cartLoading === id}
                                                    className="mt-4 w-full rounded-lg bg-[#245C45] px-2 py-2.5 text-xs font-semibold text-white transition hover:bg-[#173B2E] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                                                >
                                                    {cartLoading === id ? (
                                                        "Adding..."
                                                    ) : (
                                                        <>
                                                            <i className="fa-solid fa-cart-shopping mr-2" />
                                                            Add to Cart
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Products;