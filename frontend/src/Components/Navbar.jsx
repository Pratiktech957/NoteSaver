import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                <Link to="/">
                    <h1 className="text-2xl font-bold text-blue-600">
                        NoteSaver
                    </h1>
                </Link>

                <div className="hidden md:flex gap-8">
                    <a href="#features" className="hover:text-blue-600">
                        Features
                    </a>
                    <a href="#stats" className="hover:text-blue-600">
                        Stats
                    </a>
                    <a href="#contact" className="hover:text-blue-600">
                        Contact
                    </a>
                </div>

                <div className="flex gap-3">
                    <Link to="/login">
                        <button className="border border-blue-600 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50">
                            Login
                        </button>
                    </Link>

                    <Link to="/register">
                        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
                            Get Started
                        </button>
                    </Link>
                </div>

            </div>
        </nav>
    );
}