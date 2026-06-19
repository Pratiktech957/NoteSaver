import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
    const { user, token } = useAuth();

    console.log("ADMIN ROUTE USER:", user);
    console.log("ADMIN ROUTE TOKEN:", token);

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        console.log("NOT ADMIN:", user.role);
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;