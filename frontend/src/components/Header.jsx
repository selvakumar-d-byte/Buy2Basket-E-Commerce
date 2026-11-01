
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Header() {
    const [hidden, setHidden] = useState(false);
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    // Scroll Hide / Show
    useEffect(() => {
        let lastY = window.scrollY;

        function onScroll() {
            const y = window.scrollY;

            if (menuOpen) {
                setHidden(false);
            } else if (y > lastY && y > 80) {
                setHidden(true);
            } else if (y < lastY) {
                setHidden(false);
            }

            lastY = y;
        }

        window.addEventListener("scroll", onScroll, {
            passive: true
        });

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [menuOpen]);

    // Firebase Authentication
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    // Logout Function
    async function handleLogout() {
        try {
            await signOut(auth);
            setMenuOpen(false);
            alert("Logout Successfully");
        } catch (error) {
            console.error("Logout Error:", error);
            alert("Logout Failed");
        }
    }

    return (
        <header
            className={`flex flex-wrap xl:flex-nowrap justify-between items-center gap-x-4 gap-y-3 px-3 sm:px-8 lg:px-10 xl:px-16 py-3 md:py-5 border-gray-300 sticky top-0 z-50 bg-white border-b transition-transform duration-300 ${
                hidden ? "-translate-y-full shadow-lg" : "translate-y-0"
            }`}
        >

            {/* Logo */}
            <div className="flex shrink-0 gap-2 items-center text-md sm:text-xl md:text-3xl font-extrabold cursor-pointer">

                <i
                    onClick={() => setMenuOpen(true)}
                    className="fa-solid fa-bars sm:hidden"
                ></i>

                <Link
                    to="/"
                    className="flex gap-2 items-center text-md sm:text-xl md:text-3xl font-extrabold cursor-pointer"
                >
                    <i className="fa-solid fa-basket-shopping text-[#245C45]"></i>

                    <h1>
                        Buy2<span className="text-[#245C45]">Basket</span>
                    </h1>
                </Link>
            </div>


            {/* Mobile Menu */}
            <div
                id="menu_content"
                className={`fixed top-0 left-0 z-[60] h-screen w-72 max-w-[85vw] bg-white shadow-xl p-6 flex flex-col gap-8 transition-transform duration-300 sm:hidden ${
                    menuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >

                <div className="flex justify-between items-center">

                    <Link
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="flex gap-2 items-center text-xl font-extrabold cursor-pointer"
                    >
                        <i className="fa-solid fa-basket-shopping text-[#245C45]"></i>

                        <h1>
                            Buy2<span className="text-[#245C45]">Basket</span>
                        </h1>
                    </Link>

                    <button onClick={() => setMenuOpen(false)}>
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>

                </div>


                {user && (
                    <p>
                        <i className="fa-regular fa-user"></i>{" "}
                        Hi, {user.displayName || "User"}
                    </p>
                )}


                <Link to="/" onClick={() => setMenuOpen(false)}>
                    <i className="fa-solid fa-house text-[#245C45]"></i> Home
                </Link>


                <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
                    <i className="fa-solid fa-heart text-[#245C45]"></i> Wishlist
                </Link>


                <Link to="/cart" onClick={() => setMenuOpen(false)}>
                    <i className="fa-solid fa-cart-shopping text-[#245C45]"></i> Cart
                </Link>


                <Link
                    to="/my-orders"
                    onClick={() => setMenuOpen(false)}
                    className="cursor-pointer hidden min-[425px]:inline-block"
                >
                    <i className="fa-solid fa-truck text-[#245C45]"></i> Orders
                </Link>


                <Link to="/products" onClick={() => setMenuOpen(false)}>
                    <i className="fa-solid fa-bag-shopping text-[#245C45]"></i> Products
                </Link>


                <Link to="/deals" onClick={() => setMenuOpen(false)}>
                    <i className="fa-solid fa-tags text-[#245C45]"></i> Deals
                </Link>


                <Link to="/contact" onClick={() => setMenuOpen(false)}>
                    <i className="fa-solid fa-phone text-[#245C45]"></i> Contact
                </Link>


                {user ? (
                    <button
                        onClick={handleLogout}
                        className="px-3 py-2 text-white bg-red-600 rounded-xl"
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>{" "}
                        Logout
                    </button>
                ) : (
                    <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 text-white bg-[#245C45] rounded-xl"
                    >
                        <i className="fa-solid fa-arrow-right-to-bracket"></i>{" "}
                        Login
                    </Link>
                )}

            </div>


            {/* Search Bar */}
            <div
                className="order-3 xl:order-none flex w-full xl:flex-1 xl:max-w-[400px] min-w-0 items-center border border-gray-300 rounded-lg h-10 overflow-hidden focus-within:border-[#245C45]"
            >

                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full min-w-0 h-full px-3 outline-none block text-sm"
                />

                <button
                    type="button"
                    aria-label="Search"
                    className="bg-[#245C45] outline-none text-white h-full px-4 hover:bg-[#173B2E]"
                >
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>

            </div>


            {/* Wishlist / Cart / Orders / Login */}
            <div className="flex shrink-0 gap-7 xl:gap-10 items-center text-gray-700 text-sm md:text-base">

                <Link
                    to="/wishlist"
                    className="cursor-pointer hidden min-[425px]:inline-block"
                >
                    <i className="fa-regular fa-heart"></i>{" "}
                    <span className="hidden sm:inline-block">wishlist</span>
                </Link>


                <Link
                    to="/cart"
                    className="cursor-pointer hidden min-[425px]:inline-block"
                >
                    <i className="fa-solid fa-cart-shopping"></i>{" "}
                    <span className="hidden sm:inline-block">cart</span>
                </Link>


                <Link
                    to="/my-orders"
                    className="cursor-pointer hidden min-[425px]:inline-block"
                >
                    <i className="fa-solid fa-truck"></i>{" "}
                    <span className="hidden sm:inline-block">Orders</span>
                </Link>


                {user ? (
                    <button
                        onClick={handleLogout}
                        className="px-3 py-2 text-white bg-red-600 rounded-xl whitespace-nowrap"
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>{" "}
                        Logout
                    </button>
                ) : (
                    <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 text-white bg-[#245C45] rounded-xl whitespace-nowrap"
                    >
                        <i className="fa-solid fa-arrow-right-to-bracket"></i>{" "}
                        Login
                    </Link>
                )}

            </div>

        </header>
    );
}

export default Header;
