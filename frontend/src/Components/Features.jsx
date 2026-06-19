import FeatureCard from "./FeatureCard";

export default function Features() {
    const features = [
        {
            title: "Quick Notes",
            description:
                "Capture ideas instantly with lightning-fast note creation.",
            icon: "⚡",
        },
        {
            title: "Cloud Sync",
            description:
                "Access your notes across all devices seamlessly.",
            icon: "☁️",
        },
        {
            title: "Secure Storage",
            description:
                "Your notes stay encrypted and protected.",
            icon: "🔒",
        },
        {
            title: "Smart Search",
            description:
                "Find notes in seconds with powerful search.",
            icon: "🔍",
        },
    ];

    return (
        <section
            id="features"
            className="py-20 bg-gray-100"
        >
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12">
                    Features
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature) => (
                        <FeatureCard
                            key={feature.title}
                            {...feature}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}