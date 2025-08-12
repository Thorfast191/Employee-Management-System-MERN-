import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./useAuth";

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [workAssignments, setWorkAssignments] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);

  // Fetch all employees (admin only)
  const fetchEmployees = async () => {
    try {
      const response = await api.get("/admin/get-all/employees");
      setEmployees(response.data.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Fetch pending employees
  const fetchPendingEmployees = async () => {
    try {
      const response = await api.get("/admin/employees/pending");
      setPendingEmployees(response.data.data);
    } catch (error) {
      console.error("Error fetching pending employees:", error);
    }
  };

  // Fetch work assignments (admin only)
  const fetchWorkAssignments = async () => {
    try {
      const response = await api.get("/admin/work-assignments");
      setWorkAssignments(response.data.data);
    } catch (error) {
      console.error("Error fetching work assignments:", error);
    }
  };

  // Register new employee
  const registerEmployee = async (employeeData) => {
    try {
      const response = await api.post(
        "/admin/register/employees",
        employeeData
      );
      await fetchEmployees();
      return response.data;
    } catch (error) {
      console.error("Error registering employee:", error);
      throw error;
    }
  };

  // Get employee details
  const getEmployeeDetails = async (id) => {
    try {
      const response = await api.get(`/admin/get/employees/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching employee details:", error);
      throw error;
    }
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/admin/delete/employees/${id}`);
      await fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  };

  // Complete employee setup
  const completeEmployeeSetup = async (id, setupData) => {
    try {
      const response = await api.put(`/admin/employees/setup/${id}`, setupData);
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
        fetchPendingEmployees();
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
    pendingEmployees,
    workAssignments,
    registerEmployee,
    getEmployeeDetails,
    deleteEmployee,
    completeEmployeeSetup,
    fetchEmployees,
    fetchPendingEmployees,
    fetchWorkAssignments,
  };
};
