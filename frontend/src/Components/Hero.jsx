export default function Hero() {
    return (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="max-w-7xl mx-auto px-6 py-28 text-center">
                <h1 className="text-5xl font-bold mb-6">
                    Save Notes Faster Than Ever
                </h1>

                <p className="text-xl max-w-2xl mx-auto mb-58">
                    Organize ideas, store important information,
                    and access your notes anywhere with NoteSaver.
                </p>

                <div className="flex justify-center gap-4">
                    <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">
                        Start Free
                    </button>

                    <button className="border border-white px-6 py-3 rounded-lg">
                        Learn More
                    </button>
                </div>
            </div>
        </section>
    );
}