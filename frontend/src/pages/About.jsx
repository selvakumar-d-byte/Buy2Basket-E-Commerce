
function About() {
    return (
        <main className="min-h-screen bg-white">

            {/* Hero */}
            <section className="bg-[#245C45] px-4 py-16 text-center text-white sm:py-20">
                <p className="text-sm font-semibold uppercase tracking-widest text-green-200">
                    Get to Know Us
                </p>

                <h1 className="mt-3 text-3xl font-bold sm:text-5xl">
                    About Buy2Basket
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-green-100 sm:text-base">
                    Your everyday shopping destination, bringing together
                    quality products, great choices and a simple shopping experience.
                </p>
            </section>

            {/* Our Story */}
            <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:px-12">
                <div className="overflow-hidden rounded-2xl">
                    <img
                        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000"
                        alt="Online shopping"
                        className="h-72 w-full object-cover sm:h-96"
                    />
                </div>

                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#245C45]">
                        Our Story
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-gray-900">
                        Shopping Made Simple
                    </h2>

                    <p className="mt-5 leading-7 text-gray-600">
                        Buy2Basket is designed to make online shopping
                        convenient and enjoyable. We bring different product
                        categories together in one place so customers can
                        explore their favourite products with ease.
                    </p>

                    <p className="mt-4 leading-7 text-gray-600">
                        From fashion and electronics to home essentials
                        and everyday needs, our goal is to provide a smooth
                        and user-friendly shopping experience.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="bg-gray-50 px-4 py-16 sm:px-8 lg:px-12">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 text-center">
                        <p className="text-sm font-semibold uppercase tracking-wider text-[#245C45]">
                            What Drives Us
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-gray-900">
                            Our Mission & Vision
                        </h2>
                    </div>

                    <div className="grid gap-7 md:grid-cols-2">
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl text-[#245C45]">
                                ◎
                            </div>

                            <h3 className="mt-5 text-xl font-bold text-gray-900">
                                Our Mission
                            </h3>

                            <p className="mt-3 leading-7 text-gray-600">
                                To make everyday shopping easier by bringing
                                a wide range of products together through
                                a simple and convenient online platform.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl text-[#245C45]">
                                ✦
                            </div>

                            <h3 className="mt-5 text-xl font-bold text-gray-900">
                                Our Vision
                            </h3>

                            <p className="mt-3 leading-7 text-gray-600">
                                To create a trusted shopping destination
                                where customers can discover products,
                                enjoy convenience and shop with confidence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:px-12">
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#245C45]">
                        The Buy2Basket Difference
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        Why Choose Us?
                    </h2>
                </div>

                <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            icon: "▣",
                            title: "Wide Selection",
                            description: "Explore products across multiple shopping categories."
                        },
                        {
                            icon: "♡",
                            title: "Customer Focused",
                            description: "A simple experience designed around your shopping needs."
                        },
                        {
                            icon: "✦",
                            title: "Easy Shopping",
                            description: "Discover and explore your favourite products in one place."
                        }
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-gray-100 p-7 text-center transition hover:border-green-200 hover:shadow-md"
                        >
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-[#245C45]">
                                {item.icon}
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-gray-900">
                                {item.title}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

        </main>
    );
}

export default About;