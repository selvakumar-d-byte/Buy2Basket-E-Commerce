
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBasketShopping,
    faLocationDot,
    faPhone,
    faEnvelope,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
    faFacebookF,
    faInstagram,
    faXTwitter,
    faYoutube,
} from "@fortawesome/free-brands-svg-icons";

function Footer() {
    return (
        <footer className="bg-[#173B2E] text-white">

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand Section */}
                    <div>
                        <a
                            href="/"
                            className="flex items-center gap-2 text-2xl font-bold mb-4"
                        >
                            <FontAwesomeIcon
                                icon={faBasketShopping}
                                className="text-[#8ED6A9]"
                            />
                            <span>
                                Buy2<span className="text-[#8ED6A9]">Basket</span>
                            </span>
                        </a>

                        <p className="text-gray-300 text-sm leading-7 mb-5">
                            Everything you need in one place.
                            Discover quality products at great prices
                            and enjoy a convenient shopping experience.
                        </p>

                        <div className="flex gap-3">
                            {[
                                { icon: faFacebookF, label: "Facebook" },
                                { icon: faInstagram, label: "Instagram" },
                                { icon: faXTwitter, label: "X" },
                                { icon: faYoutube, label: "YouTube" },
                            ].map((social) => (
                                <p
                                    key={social.label}
                                    aria-label={social.label}
                                    className="w-9 h-9 flex items-center justify-center
                                    rounded-full bg-white/10 hover:bg-[#245C45]
                                    transition-colors duration-200"
                                >
                                    <FontAwesomeIcon icon={social.icon} />
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-5">
                            Quick Links
                        </h3>

                        <ul className="space-y-3 text-sm text-gray-300">
                            {[
                                "Home",
                                "Products",
                                "Categories",
                                "Deals & Offers",
                                "About Us",
                            ].map((item) => (
                                <li key={item}>
                                    <p
                                        className="hover:text-[#8ED6A9]
                                        transition-colors duration-200"
                                    >
                                        {item}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-5">
                            Customer Service
                        </h3>

                        <ul className="space-y-3 text-sm text-gray-300">
                            {[
                                "Contact Us",
                                "FAQs",
                                "Shipping Information",
                                "Returns & Refunds",
                                "Privacy Policy",
                                "Terms & Conditions",
                            ].map((item) => (
                                <li key={item}>
                                    <p
                                        className="hover:text-[#8ED6A9]
                                        transition-colors duration-200"
                                    >
                                        {item}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-5">
                            Get in Touch
                        </h3>

                        <ul className="space-y-4 text-sm text-gray-300">
                            <li className="flex items-start gap-3">
                                <FontAwesomeIcon
                                    icon={faLocationDot}
                                    className="mt-1 text-[#8ED6A9]"
                                />
                                <span>
                                    Shop from anywhere,
                                    anytime.
                                </span>
                            </li>

                            <li className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faPhone}
                                    className="text-[#8ED6A9]"
                                />
                                <span>Customer Support</span>
                            </li>

                            <li className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faEnvelope}
                                    className="text-[#8ED6A9]"
                                />
                                <span className="break-all">
                                    support@buy2basket.com
                                </span>
                            </li>
                        </ul>

                        <h4 className="font-medium mt-6 mb-3">
                            Get product updates
                        </h4>

                        <form
                            className="flex items-center rounded-lg overflow-hidden
                            bg-white"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <input
                                type="email"
                                placeholder="Your email address"
                                aria-label="Your email address"
                                className="w-full min-w-0 px-3 py-3
                                text-sm text-gray-800 outline-none"
                                required
                            />

                            <button
                                type="submit"
                                aria-label="Subscribe"
                                className="px-4 py-3 bg-[#245C45]
                                hover:bg-[#326F56] text-white
                                transition-colors"
                            >
                                <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </form>
                    </div>

                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-white/15">
                <div className="max-w-7xl mx-auto px-5 sm:px-8
                lg:px-12 py-5 flex flex-col sm:flex-row
                justify-between items-center gap-3 text-sm
                text-gray-300">

                    <p className="text-center">
                        © {new Date().getFullYear()} Buy2Basket.
                        All rights reserved.
                    </p>

                    <p>
                        Made with
                        <span className="text-red-400"> ♥ </span>
                        for your shopping needs.
                    </p>

                </div>
            </div>

        </footer>
    );
}

export default Footer;
