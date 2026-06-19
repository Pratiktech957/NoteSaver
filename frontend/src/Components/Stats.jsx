export default function Stats() {
    const stats = [
        { value: "50K+", label: "Users" },
        { value: "1M+", label: "Notes Saved" },
        { value: "99.9%", label: "Uptime" },
        { value: "24/7", label: "Availability" },
    ];

    return (
        <section
            id="stats"
            className="py-20 bg-white"
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                    {stats.map((item) => (
                        <div key={item.label}>
                            <h3 className="text-4xl font-bold text-blue-600">
                                {item.value}
                            </h3>
                            <p className="text-gray-500 mt-2">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}