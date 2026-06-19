export default function Footer() {
    return (
        <footer
            id="contact"
            className="bg-gray-900 text-white py-10"
        >
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-2xl font-bold mb-4">
                    NoteSaver
                </h2>

                <p className="text-gray-400 mb-4">
                    Save, organize, and access your notes
                    anywhere.
                </p>

                <div className="flex justify-center gap-6 mb-6">
                    <a href="#">Twitter</a>
                    <a href="#">Github</a>
                    <a href="#">LinkedIn</a>
                </div>

                <p className="text-gray-500">
                    © 2026 NoteSaver. All rights reserved.
                </p>
            </div>
        </footer>
    );
}