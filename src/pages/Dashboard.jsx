import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiCheckCircle,
} from "react-icons/fi";
import { BASE_API_URL } from "../utils/config";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totals, setTotals] = useState({
    total_user: 0,
    total_product: 0,
    total_order: 0,
    total_success_order: 0,
  });

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = (() => {
          try {
            return localStorage.getItem("admin_token") || "";
          } catch (e) {
            return "";
          }
        })();

        const res = await axios.post(
          `${BASE_API_URL}/dashboard`,
          {},
          {
            headers: {
              token,
            },
          },
        );

        if (!mounted) return;

        const data = res?.data?.data;
        setTotals({
          total_user: Number(data?.total_user || 0),
          total_product: Number(data?.total_product || 0),
          total_order: Number(data?.total_order || 0),
          total_success_order: Number(data?.total_success_order || 0),
        });
      } catch (e) {
        if (!mounted) return;
        setError("Failed to fetch dashboard");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        title: "Total Users",
        value: totals.total_user,
        icon: FiUsers,
        color: "text-primary",
      },
      {
        title: "Total Products",
        value: totals.total_product,
        icon: FiPackage,
        color: "text-warning",
      },
      {
        title: "Total Orders",
        value: totals.total_order,
        icon: FiShoppingCart,
        color: "text-secondary",
      },
      {
        title: "Success Orders",
        value: totals.total_success_order,
        icon: FiCheckCircle,
        color: "text-success",
      },
    ],
    [totals],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container-fluid"
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0">Dashboard</h1>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="card shadow-sm h-100"
            >
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small">{stat.title}</div>
                  <div className="h4 mb-0">{loading ? "..." : stat.value}</div>
                </div>
                <div className={stat.color}>
                  <stat.icon size={24} />
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="col-12 col-lg-6"
        >
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Recent Activity</h2>
              <div className="list-group list-group-flush">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span className="text-secondary">
                      User {item} logged in
                    </span>
                    <span className="text-muted small">2h ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="col-12 col-lg-6"
        >
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5">Quick Actions</h2>
              <div className="d-grid gap-2">
                <button type="button" className="btn btn-outline-primary">
                  Add New User
                </button>
                <button type="button" className="btn btn-outline-success">
                  View Orders
                </button>
                <button type="button" className="btn btn-outline-secondary">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
