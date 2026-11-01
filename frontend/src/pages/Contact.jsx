
function Contact() {
    return (
        <main className="min-h-screen bg-gray-50">

            {/* Hero */}
            <section className="bg-[#245C45] px-4 py-16 text-center text-white sm:py-20">
                <p className="text-sm font-semibold uppercase tracking-widest text-green-200">
                    We'd Love to Hear From You
                </p>

                <h1 className="mt-3 text-3xl font-bold sm:text-5xl">
                    Contact Us
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-green-100 sm:text-base">
                    Have a question or need assistance? We'd be happy
                    to hear from you.
                </p>
            </section>

            {/* Contact Content */}
            <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">

                {/* Contact Information */}
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#245C45]">
                        Get In Touch
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        Let's Talk
                    </h2>

                    <p className="mt-4 leading-7 text-gray-500">
                        We're here to help with your questions and
                        shopping experience.
                    </p>

                    <div className="mt-9 space-y-6">

                        {[
                            {
                                icon: "✉",
                                title: "Email Us",
                                detail: "support@buy2basket.com"
                            },
                            {
                                icon: "☎",
                                title: "Call Us",
                                detail: "+91 98765 43210"
                            },
                            {
                                icon: "⌖",
                                title: "Our Location",
                                detail: "Tamil Nadu, India"
                            }
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="flex items-center gap-4"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl text-[#245C45]">
                                    {item.icon}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {item.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {item.detail}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 rounded-xl bg-[#245C45] p-6 text-white">
                        <h3 className="text-lg font-bold">
                            We're Here for You
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-green-100">
                            Your questions and feedback help us improve
                            the Buy2Basket shopping experience.
                        </p>
                    </div>
                </div>

                {/* Contact Form UI */}
                <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-9">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Send Us a Message
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Fill in the details below.
                    </p>

                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="mt-7 space-y-5"
                    >
                        <div className="grid gap-5 sm:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Your Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#245C45]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#245C45]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Subject
                            </label>

                            <input
                                type="text"
                                placeholder="Enter subject"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#245C45]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Your Message
                            </label>

                            <textarea
                                rows="5"
                                placeholder="Write your message here..."
                                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#245C45]"
                            />
                        </div>

                        <button
                            type="button"
                            className="w-full rounded-lg bg-[#245C45] py-3 font-semibold text-white transition hover:bg-[#173B2E]"
                        >
                            Send Message →
                        </button>
                    </form>
                </div>

            </section>

        </main>
    );
}

export default Contact;
