import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Add explicit Authorization header
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUser(response.data.data);
        } else {
          throw new Error("Invalid user data");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        // // Optional: redirect to login if token is invalid
        // navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]); // Added navigate to dependencies

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (!response.data.success) {
        throw new Error(response.data.error || "Login failed");
      }

      // Handle both cookie and token responses
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Ensure user data is properly set
      if (response.data.user) {
        setUser(response.data.user);
        navigate("/dashboard");
        return { success: true };
      } else {
        throw new Error("No user data received");
      }
    } catch (error) {
      console.error("Login API error:", error.response?.data || error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Login failed",
      };
    }
  };

  // const logout = async () => {
  //   try {
  //     await api.get("/auth/logout");
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //   } finally {
  //     localStorage.removeItem("token");
  //     setUser(null);
  //     navigate("/login", { replace: true });
  //   }
  // };

  // return { user, loading, login, logout };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear token and user state first
      localStorage.removeItem("token");
      setUser(null);

      // Force a hard refresh to ensure clean state
      window.location.href = "/login";
    }
  };
  return { user, loading, login, logout };
};
