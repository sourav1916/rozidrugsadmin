import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiShoppingCart, FiFilter, FiDownload, FiEye } from "react-icons/fi";

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [orders] = useState([
    {
      id: "ORD001",
      customer: "John Doe",
      product: "Medicine A",
      amount: 45.99,
      status: "pending",
      date: "2024-03-01",
    },
    {
      id: "ORD002",
      customer: "Jane Smith",
      product: "Medicine B",
      amount: 32.5,
      status: "processing",
      date: "2024-03-02",
    },
    {
      id: "ORD003",
      customer: "Bob Johnson",
      product: "Medicine C",
      amount: 78.25,
      status: "completed",
      date: "2024-03-02",
    },
    {
      id: "ORD004",
      customer: "Alice Brown",
      product: "Medicine D",
      amount: 15.75,
      status: "cancelled",
      date: "2024-03-03",
    },
    {
      id: "ORD005",
      customer: "Charlie Wilson",
      product: "Medicine E",
      amount: 92.4,
      status: "completed",
      date: "2024-03-03",
    },
  ]);

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-bg-warning";
      case "processing":
        return "text-bg-primary";
      case "completed":
        return "text-bg-success";
      case "cancelled":
        return "text-bg-danger";
      default:
        return "text-bg-secondary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container-fluid"
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 d-flex align-items-center gap-2">
          <FiShoppingCart /> Orders Management
        </h1>
        <button
          type="button"
          className="btn btn-success d-flex align-items-center gap-2"
        >
          <FiDownload /> Export Orders
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-3">
            <FiFilter className="text-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ maxWidth: 220 }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="fw-semibold">{order.id}</td>
                    <td className="text-muted">{order.customer}</td>
                    <td className="text-muted">{order.product}</td>
                    <td className="text-muted">${order.amount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-muted">{order.date}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        aria-label="View"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {["pending", "processing", "completed", "cancelled"].map((status) => {
          const count = orders.filter(
            (order) => order.status === status,
          ).length;
          return (
            <div key={status} className="col-12 col-md-6 col-lg-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="card shadow-sm h-100"
              >
                <div className="card-body">
                  <div className="text-muted text-capitalize">{status}</div>
                  <div className="display-6 mb-0">{count}</div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Orders;
