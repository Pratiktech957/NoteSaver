import {
    createContext,
    useContext,
    useState
} from "react";

const AuthContext =
    createContext();

export const AuthProvider = ({
    children
}) => {

    const [user, setUser] =
        useState(
            JSON.parse(
                localStorage.getItem("user")
            ) || null
        );

    const [token, setToken] =
        useState(
            localStorage.getItem("token") || null
        );

    const login = (
        userData,
        tokenData
    ) => {

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        localStorage.setItem(
            "token",
            tokenData
        );

        setUser(userData);
        setToken(tokenData);

    };

    const logout = () => {

        localStorage.removeItem(
            "user"
        );

        localStorage.removeItem(
            "token"
        );

        setUser(null);
        setToken(null);

    };

    const updateUser = (
        updatedUser
    ) => {

        setUser(updatedUser);

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                setUser,
                updateUser
            }}
        >

            {children}

        </AuthContext.Provider>

    );

};

export const useAuth = () => {

    return useContext(
        AuthContext
    );

};