import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import cartImage from "../assets/images/cart.png";
import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

function Home() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [user, setUser] = useState(null)

    const categories = [
        { name: "Fashion", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop" },
        { name: "Electronics", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop" },
        { name: "Home & Living", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop" },
        { name: "Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop" },
        { name: "Sports", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop" },
        { name: "Kitchen", image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop" },
        { name: "Toys & Games", image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=200&h=200&fit=crop" },
        { name: "Watches", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&h=200&fit=crop" },
        { name: "Bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop" },
        { name: "Books", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop" },
    ];

    const promotions = [
        {
            title: "Up to 50% OFF",
            subtitle: "on Electronics",
            image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=384&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
            background: "bg-[#D1F5DF]",
            buttonColor: "bg-[#075E46]",
            textColor: "text-[#075E46]",
        },
        {
            title: "Trendy Fashion",
            subtitle: "Latest Collection",
            image: "https://images.unsplash.com/photo-1602810320073-1230c46d89d4?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
            background: "bg-[#FFE1DA]",
            buttonColor: "bg-[#963323]",
            textColor: "text-[#963323]",
        },
        {
            title: "Home Essentials",
            subtitle: "for a Better Living",
            image: "https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
            background: "bg-[#D5E9FF]",
            buttonColor: "bg-[#164A7B]",
            textColor: "text-[#164A7B]",
        },
    ];

    useEffect(() => {
        const getRandomProducts = async () => {
            try {
                auth.onAuthStateChanged((user) => {
                    if (user) { setUser(true) }
                })

                const response = await axios.get("http://localhost:5000/products");

                const allProducts = Array.isArray(response.data) ? response.data : response.data.products || [];

                const randomProducts = [...allProducts].sort(() => Math.random() - 0.5).slice(0, 5);

                setProducts(randomProducts);
            } catch (error) {
                console.error("Products fetch error:", error);
            } finally {
                setLoadingProducts(false);
            }
        };

        getRandomProducts();
    }, []);

    return (
        <main className="bg-[#F8FAF8]">
            <section className="px-3 sm:px-6 lg:px-10 pt-3 md:pt-5">
                <div className="relative overflow-hidden rounded-xl bg-[#E8F8EE] min-h-[320px] md:min-h-[290px] flex items-center">

                    <div className="relative z-10 w-full md:w-1/2 px-5 py-8 sm:px-8 lg:px-16 md:py-10">
                        <p className="text-xs sm:text-sm font-bold text-[#075E46] mb-3">WELCOME TO BUY2BASKET</p>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[#123D32]">Everything You Need<br />in One Place</h1>
                        <p className="mt-3 text-sm sm:text-base text-[#244A3E] max-w-lg">Shop from a wide range of products – Fashion, Electronics, Home Essentials, Accessories and more!</p>
                        <div className="flex gap-5 items-center mt-5 text-sm font-semibold text-white">
                             <Link to={'/products'}><button className=" flex items-center gap-3 rounded-xl bg-[#087A54] px-5 py-3 hover:bg-[#075E46] transition-colors">Shop Now<i className="fa-solid fa-arrow-right"></i></button></Link>
                            {!user && <Link to={'/login'}><button className=" border border-[#087A54] text-[#087A54] p-3 rounded-xl">Sign In</button></Link>}
                        </div>
                    </div>

                    <div className="hidden md:flex w-1/2 h-full min-h-[290px] items-center justify-center p-5">
                        <img src={cartImage} alt="Shopping trolley filled with products" className="w-full h-[280px] object-contain" />
                    </div>
                </div>
            </section>


            <section className="px-3 sm:px-6 lg:px-10 py-6 md:py-7">
                <div className="flex justify-between gap-4 sm:gap-6 md:gap-5 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                        <div key={category.name} className="flex min-w-[82px] flex-col items-center gap-2 cursor-pointer group">
                            <Link to={'/products'}>
                                <div className="w-[76px] h-[76px] sm:w-[90px] sm:h-[90px] overflow-hidden rounded-xl bg-white">
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>

                                <p className="text-xs sm:text-sm font-medium text-center whitespace-nowrap text-gray-800">{category.name}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-3 sm:px-6 lg:px-10 py-6 bg-[#F5F8F6]">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#123D32]"> Featured Products </h2>
                    <button className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#087A54] hover:text-[#123D32]"> <Link to={'/products'}>View All</Link>  <i className="fa-solid fa-arrow-right"></i></button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {loadingProducts ? (
                        <p className="col-span-full py-8 text-center text-gray-500"> Loading products... </p>
                    ) : products.length === 0 ? (
                        <p className="col-span-full py-8 text-center text-gray-500">No products available.</p>
                    ) : (
                        products.map((product) => (
                            <article key={product._id} className="relative flex flex-col rounded-xl border border-gray-200 bg-white p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex w-full h-32 sm:h-40 items-center justify-center">
                                    <img src={product.image} alt={product.name}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "https://placehold.co/300x300?text=No+Image";
                                        }}
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <h3 className="mt-2 min-h-10 text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2">
                                    {product.name}
                                </h3>

                                <div className="flex items-center gap-1 mt-2 text-xs">
                                    <i className="fa-solid fa-star text-amber-400"></i>

                                    <span className="font-semibold text-[#087A54]">
                                        {product.rating ?? 4}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-sm sm:text-base font-bold text-[#087A54]">₹{product.price}</span>
                                    {product.originalPrice > product.price && (
                                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                                    )}
                                </div>

                                {product.discount > 0 && (
                                    <span className="mt-2 w-fit rounded-full bg-[#D5F3E5] px-2 py-1 text-[10px] font-semibold text-[#087A54]">
                                        {product.discount}% OFF
                                    </span>
                                )}

                                <div className="mt-3 flex items-center gap-2">
                                    <button className="flex-1 rounded-lg bg-[#087A54] py-2 text-[11px] sm:text-sm font-semibold text-white hover:bg-[#075E46] transition-colors">Add to Cart</button>

                                    <button
                                        aria-label={`Add ${product.name} to wishlist`}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:text-red-500 hover:border-red-200"
                                    >
                                        <i className="fa-regular fa-heart"></i>
                                    </button>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>

            <section className="px-3 sm:px-6 lg:px-10 py-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {promotions.map((promotion) => (
                        <div key={promotion.title} className={`relative flex min-h-[150px] overflow-hidden rounded-xl ${promotion.background}`}>
                            <div className="relative z-10 flex w-3/5 flex-col justify-center p-4 sm:p-5">
                                <h3 className={`text-lg sm:text-xl font-bold ${promotion.textColor}`}>{promotion.title}</h3>
                                <p className={`text-sm ${promotion.textColor}`}>{promotion.subtitle}</p>
                                <button onClick={() => navigate('/products')} className={`mt-3 w-fit rounded-full px-4 py-2 text-xs font-semibold text-white ${promotion.buttonColor} hover:opacity-90`}>Shop Now</button>
                            </div>

                            <div className="flex w-2/5 items-center justify-center h-full p-2 ">
                                <img src={promotion.image} alt={promotion.title} className="h-full w-full object-contain rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    )
}

export default Home;