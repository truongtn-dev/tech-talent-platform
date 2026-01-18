import { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = authService.getCurrentUser();
        return savedUser || null;
    });
    const [loading, setLoading] = useState(false); // No longer loading asynchronously for user check

    useEffect(() => {
        // Still keep the effect if you want to sync with tabs or something, 
        // but synchronous init is better for child providers.
    }, []);

    const login = async (credentials) => {
        const data = await authService.login(credentials);
        // authService.login should return { token, user: {...} }
        // We can save token here or let authService handle it.
        // authService.login in previous step didn't save locally, let's update it.
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
        }
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        // userData can be JSON or FormData
        const data = await authService.register(userData);
        // Auto-login after registration
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
        }
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
