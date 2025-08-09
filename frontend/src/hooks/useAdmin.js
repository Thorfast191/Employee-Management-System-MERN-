import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./useAuth";

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === "admin");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user]);

  return { isAdmin, loading };
};
