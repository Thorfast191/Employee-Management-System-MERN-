import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./useAuth";

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [workAssignments, setWorkAssignments] = useState([]);

  // Fetch all employees (admin only)
  const fetchEmployees = async () => {
    try {
      const response = await api.get("/api/v1/admin/employees");
      setEmployees(response.data.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Fetch work assignments (admin only)
  const fetchWorkAssignments = async () => {
    try {
      const response = await api.get("/api/v1/admin/work-assignments");
      setWorkAssignments(response.data.data);
    } catch (error) {
      console.error("Error fetching work assignments:", error);
    }
  };

  // Register new employee
  const registerEmployee = async (employeeData) => {
    try {
      const response = await api.post("/api/v1/admin/employees", employeeData);
      await fetchEmployees();
      return response.data;
    } catch (error) {
      console.error("Error registering employee:", error);
      throw error;
    }
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/api/v1/admin/employees/${id}`);
      await fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  };

  // Complete employee setup
  const completeEmployeeSetup = async (id, setupData) => {
    try {
      const response = await api.put(
        `/api/v1/admin/employees/${id}/setup`,
        setupData
      );
      await fetchEmployees();
      return response.data;
    } catch (error) {
      console.error("Error completing employee setup:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === "admin");
      setLoading(false);

      // Fetch data if admin
      if (user.role === "admin") {
        fetchEmployees();
        fetchWorkAssignments();
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    isAdmin,
    loading,
    employees,
    workAssignments,
    registerEmployee,
    deleteEmployee,
    completeEmployeeSetup,
    fetchEmployees,
    fetchWorkAssignments,
  };
};
