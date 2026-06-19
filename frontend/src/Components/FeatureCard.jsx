export default function FeatureCard({
    title,
    description,
    icon,
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:-translate-y-2 transition">
            <div className="text-4xl mb-4">{icon}</div>

            <h3 className="text-xl font-semibold mb-3">
                {title}
            </h3>

            <p className="text-gray-600">
                {description}
            </p>
        </div>
    );
}