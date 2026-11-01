function Footer() {
    return (
        <footer className="bg-[#173B2E] text-white">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div>
                        <a href="/" className="flex items-center gap-2 text-2xl font-bold mb-4">
                            <i className="fa-solid fa-basket-shopping text-[#8ED6A9]"></i>
                            <span>
                                Buy2<span className="text-[#8ED6A9]">Basket</span>
                            </span>
                        </a>

                        <p className="text-gray-300 text-sm leading-7 mb-5">
                            Everything you need in one place.
                            Discover quality products at great prices
                            and enjoy a convenient shopping experience.
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/15">
                <div className="max-w-7xl mx-auto px-5 sm:px-8
                lg:px-12 py-5 flex flex-col sm:flex-row
                justify-between items-center gap-3 text-sm
                text-gray-300">

                    <p className="text-center">&copy; {new Date().getFullYear()} Buy2Basket. All rights reserved.</p>

                    <p>Made with<span className="text-red-400"> ♥ </span>for your shopping needs.</p>

                </div>
            </div>

        </footer>
    );
}

export default Footer;
