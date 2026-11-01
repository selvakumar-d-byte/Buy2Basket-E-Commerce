
const deals = [
    {
        title: "Fashion Sale",
        subtitle: "Upgrade your everyday style",
        discount: "UP TO 50% OFF",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900",
        bg: "bg-green-50"
    },
    {
        title: "Electronics Deals",
        subtitle: "Smart gadgets at better prices",
        discount: "UP TO 40% OFF",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900",
        bg: "bg-gray-100"
    },
    {
        title: "Home Essentials",
        subtitle: "Make your home feel special",
        discount: "UP TO 35% OFF",
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900",
        bg: "bg-orange-50"
    }
];

function Deals() {
    return (
        <main className="min-h-screen bg-gray-50">

            <section className="bg-[#245C45] px-4 py-16 text-center text-white sm:py-20">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-200">
                    Special Offers
                </p>

                <h1 className="text-3xl font-bold sm:text-5xl">
                    Great Deals, Better Choices
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-sm text-green-100 sm:text-base">
                    Discover amazing offers across your favourite categories
                    and enjoy shopping at great prices.
                </p>

                <span className="mt-7 inline-block rounded-full bg-white px-6 py-3 font-semibold text-[#245C45]">
                    Explore Our Deals
                </span>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8 lg:px-12">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#245C45]">
                        Don't Miss Out
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                        Today's Best Deals
                    </h2>
                    <p className="mt-2 text-gray-500">
                        Find something you love at a price you'll love even more.
                    </p>
                </div>

                <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                    {deals.map((deal) => (
                        <div
                            key={deal.title}
                            className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={deal.image}
                                    alt={deal.title}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />

                                <span className="absolute left-4 top-4 rounded-full bg-[#245C45] px-4 py-2 text-xs font-bold text-white">
                                    {deal.discount}
                                </span>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {deal.title}
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
                                    {deal.subtitle}
                                </p>

                                <div className="mt-5 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#245C45]">
                                        Explore Collection
                                    </span>

                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-lg text-[#245C45] transition group-hover:bg-[#245C45] group-hover:text-white">
                                        →
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-4 mb-14 rounded-2xl bg-[#173B2E] px-5 py-12 text-center text-white sm:mx-8 lg:mx-12">
                <h2 className="text-2xl font-bold sm:text-3xl">
                    More Shopping. More Savings.
                </h2>
                <p className="mt-3 text-sm text-green-100">
                    Explore Buy2Basket and discover products you'll love.
                </p>
            </section>

        </main>
    );
}

export default Deals;
