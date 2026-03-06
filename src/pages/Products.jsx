import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPackage,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiDollarSign,
} from "react-icons/fi";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products] = useState([
    {
      id: 1,
      name: "Paracetamol",
      category: "Pain Relief",
      price: 5.99,
      stock: 150,
      status: "in-stock",
      description: "Common pain reliever",
    },
    {
      id: 2,
      name: "Amoxicillin",
      category: "Antibiotics",
      price: 12.5,
      stock: 5,
      status: "low-stock",
      description: "Broad spectrum antibiotic",
    },
    {
      id: 3,
      name: "Ibuprofen",
      category: "Pain Relief",
      price: 7.25,
      stock: 0,
      status: "out-of-stock",
      description: "Anti-inflammatory drug",
    },
    {
      id: 4,
      name: "Vitamin C",
      category: "Supplements",
      price: 8.99,
      stock: 200,
      status: "in-stock",
      description: "Immune system support",
    },
    {
      id: 5,
      name: "Aspirin",
      category: "Pain Relief",
      price: 4.5,
      stock: 75,
      status: "in-stock",
      description: "Blood thinner and pain reliever",
    },
  ]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "in-stock":
        return "text-bg-success";
      case "low-stock":
        return "text-bg-warning";
      case "out-of-stock":
        return "text-bg-danger";
      default:
        return "text-bg-secondary";
    }
  };

  const getStockStatusColor = (stock) => {
    if (stock === 0) return "text-danger";
    if (stock < 10) return "text-warning";
    return "text-success";
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
          <FiPackage /> Products Management
        </h1>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="fw-semibold">{product.name}</td>
                    <td className="text-muted">{product.category}</td>
                    <td className="text-muted">
                      <span className="d-inline-flex align-items-center gap-1">
                        <FiDollarSign className="text-muted" />
                        {product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="fw-semibold">
                      <span className={getStockStatusColor(product.stock)}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusColor(product.status)}`}
                      >
                        {product.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="text-muted" style={{ maxWidth: 360 }}>
                      {product.description}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-2"
                        aria-label="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        aria-label="Delete"
                      >
                        <FiTrash2 />
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
        <div className="col-12 col-md-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="card shadow-sm h-100"
          >
            <div className="card-body">
              <div className="text-muted">Total Products</div>
              <div className="display-6 mb-0">{products.length}</div>
            </div>
          </motion.div>
        </div>
        <div className="col-12 col-md-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="card shadow-sm h-100"
          >
            <div className="card-body">
              <div className="text-muted">Low Stock Items</div>
              <div className="display-6 mb-0">
                {products.filter((p) => p.status === "low-stock").length}
              </div>
            </div>
          </motion.div>
        </div>
        <div className="col-12 col-md-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="card shadow-sm h-100"
          >
            <div className="card-body">
              <div className="text-muted">Out of Stock</div>
              <div className="display-6 mb-0">
                {products.filter((p) => p.status === "out-of-stock").length}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Products;
