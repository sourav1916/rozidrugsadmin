import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import {
  FiShoppingCart,
  FiFilter,
  FiEye,
  FiSearch,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { BASE_API_URL } from "../utils/config";

const formatDate = (v) => {
  if (v == null || v === "") return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(v);
  }
};

const SkeletonCell = ({ width = "60%" }) => (
  <span
    className="placeholder"
    style={{ width, display: "inline-block", minHeight: "1em" }}
  />
);

const SkeletonRow = () => (
  <tr>
    <td><SkeletonCell width="2em" /></td>
    <td><SkeletonCell width="70%" /></td>
    <td><SkeletonCell width="90%" /></td>
    <td><SkeletonCell width="50%" /></td>
    <td><SkeletonCell width="60%" /></td>
    <td><SkeletonCell width="50%" /></td>
    <td><SkeletonCell width="4em" /></td>
  </tr>
);

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit] = useState(20);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({
    page_no: 1,
    limit: 20,
    total_items: 0,
    total_pages: 1,
    is_last_page: true,
    has_more: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jumpPage, setJumpPage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelTargetOrder, setCancelTargetOrder] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const token = useMemo(() => {
    try {
      return localStorage.getItem("admin_token") || "";
    } catch (e) {
      return "";
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.post(
          `${BASE_API_URL}/order/list`,
          {
            page_no: pageNo,
            limit,
            search: search.trim(),
            status: filterStatus || undefined,
          },
          {
            headers: {
              token,
            },
          },
        );

        if (!mounted) return;

        if (res?.data?.error) {
          setError(res?.data?.msg || "Failed to fetch orders");
          setOrders([]);
          setMeta({
            page_no: 1,
            limit,
            total_items: 0,
            total_pages: 1,
            is_last_page: true,
            has_more: false,
          });
          return;
        }

        setOrders(Array.isArray(res?.data?.data) ? res.data.data : []);
        const m = res?.data?.meta || {};
        setMeta({
          page_no: Number(m.page_no ?? pageNo),
          limit: Number(m.limit ?? limit),
          total_items: Number(m.total_items ?? 0),
          total_pages: Number(m.total_pages ?? 1),
          is_last_page: Boolean(m.is_last_page),
          has_more: Boolean(m.has_more),
        });
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.msg || e?.message || "Failed to fetch orders",
        );
        setOrders([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, [limit, pageNo, search, filterStatus, token, refreshKey]);

  useEffect(() => {
    setPageNo(1);
  }, [search, filterStatus]);

  const canPrev = meta.page_no > 1;
  const canNext = meta.page_no < meta.total_pages;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-bg-warning";
      case "success":
        return "text-bg-success";
      case "cancel":
        return "text-bg-danger";
      default:
        return "text-bg-secondary";
    }
  };

  const getCustomerDisplay = (order) => {
    const user = order.user;
    if (user?.name) return user.name;
    if (order.username) return order.username;
    return "-";
  };

  const getItemsDisplay = (order) => {
    const count = order.items_count ?? 0;
    return count > 0 ? `${count} item${count !== 1 ? "s" : ""}` : "-";
  };

  const getAmountDisplay = (order) => {
    const amount =
      order.status === "success"
        ? Number(order.bill_amount ?? 0)
        : Number(order.order_amount ?? 0);
    return amount > 0
      ? `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
      : "-";
  };

  const getOrderDate = (order) => {
    const raw = order.order_date || order.create_date;
    return formatDate(raw);
  };

  const handleCancelOrder = async () => {
    if (!cancelTargetOrder?.order_id) return;
    try {
      setCancelLoading(true);
      const res = await axios.post(
        `${BASE_API_URL}/order/cancel`,
        { order_id: cancelTargetOrder.order_id },
        { headers: { token } },
      );
      if (res?.data?.error === false) {
        setCancelTargetOrder(null);
        setRefreshKey((k) => k + 1);
      } else {
        setError(res?.data?.msg || "Failed to cancel order");
      }
    } catch (e) {
      setError(e?.response?.data?.msg || e?.message || "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  const fmt = (v) => (v != null && v !== "" ? String(v) : "-");
  const fmtNum = (n) => (Number(n) != null && !Number.isNaN(Number(n)) ? Number(n) : 0);
  const fmtCurrency = (n) =>
    fmtNum(n) > 0 ? `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container-fluid"
    >
      <div className="mb-4">
        <h1 className="h3 mb-0 d-flex align-items-center gap-2">
          <FiShoppingCart /> Orders Management
        </h1>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-3 mb-3">
            <div className="input-group" style={{ maxWidth: 320 }}>
              <span className="input-group-text">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by username, status, amount..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
            <FiFilter className="text-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ maxWidth: 220 }}
            >
                <option value="">All Orders</option>
              <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="cancel">Cancelled</option>
            </select>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 50 }}>SL</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="placeholder-glow">
                {loading ? (
                  Array.from({ length: 15 }, (_, i) => <SkeletonRow key={i} />)
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                  <motion.tr
                      key={order.id ?? order.order_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                      <td className="text-muted">
                        {(meta.page_no - 1) * meta.limit + index + 1}
                      </td>
                      <td className="text-muted">{getOrderDate(order)}</td>
                      <td className="fw-semibold">
                        {getCustomerDisplay(order)}
                      </td>
                      <td className="text-muted">{getItemsDisplay(order)}</td>
                      <td className="text-muted">{getAmountDisplay(order)}</td>
                      <td>
                        <span
                          className={`badge ${getStatusColor(order.status)}`}
                        >
                          {order.status || "-"}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                        aria-label="View"
                          onClick={() => setSelectedOrder(order)}
                      >
                        <FiEye />
                      </button>
                        {order.status === "pending" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            aria-label="Cancel"
                            onClick={() => setCancelTargetOrder(order)}
                          >
                            <FiXCircle />
                          </button>
                        )}
                    </td>
                  </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mt-3">
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                onClick={() => setPageNo(1)}
                disabled={!canPrev || loading}
              >
                <FiChevronsLeft /> First
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                onClick={() => setPageNo((p) => Math.max(1, p - 1))}
                disabled={!canPrev || loading}
              >
                <FiChevronLeft /> Prev
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                onClick={() =>
                  setPageNo((p) => Math.min(meta.total_pages, p + 1))
                }
                disabled={!canNext || loading}
              >
                Next <FiChevronRight />
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                onClick={() => setPageNo(meta.total_pages)}
                disabled={!canNext || loading}
              >
                Last <FiChevronsRight />
              </button>
              <div className="ms-2 text-muted small">
                Page <strong>{meta.page_no}</strong> of{" "}
                <strong>{meta.total_pages}</strong>
                <span className="ms-2">({meta.total_items} total)</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 ms-md-auto">
              <div className="text-muted small">Jump to page</div>
              <input
                type="number"
                className="form-control form-control-sm"
                style={{ width: 110 }}
                min={1}
                max={meta.total_pages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const next = Number(jumpPage);
                  if (!Number.isFinite(next)) return;
                  if (next < 1 || next > meta.total_pages) return;
                  setPageNo(next);
                }}
                placeholder="e.g. 3"
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={loading}
                onClick={() => {
                  const next = Number(jumpPage);
                  if (!Number.isFinite(next)) return;
                  if (next < 1 || next > meta.total_pages) return;
                  setPageNo(next);
                }}
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
              onClick={() => setSelectedOrder(null)}
            />
              <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="position-fixed top-50 start-50 translate-middle overflow-hidden d-flex flex-column"
              style={{ width: "min(920px, calc(100vw - 32px))", maxHeight: "calc(100vh - 32px)", zIndex: 1060 }}
              role="dialog"
              aria-modal="true"
            >
              <div
                className="flex-grow-1 d-flex flex-column overflow-hidden rounded-3 shadow-lg border-0"
                style={{
                  background: "linear-gradient(180deg, #f8fafc 0%, #fff 12%)",
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom"
                  style={{ background: "rgba(255,255,255,0.9)" }}
                >
                  <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                    <FiShoppingCart size={20} className="text-primary" />
                    Order Details
                  </h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-circle p-2"
                    onClick={() => setSelectedOrder(null)}
                    aria-label="Close"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <div className="overflow-auto flex-grow-1 p-4">
                  <div className="row g-4">
                    <div className="col-12">
                      <div
                        className="rounded-3 p-4"
                        style={{ background: "rgba(13,110,253,0.04)", border: "1px solid rgba(13,110,253,0.12)" }}
                      >
                        <div className="row g-3">
                          <div className="col-6 col-lg-4">
                            <div className="small text-muted mb-1" style={{ letterSpacing: "0.04em" }}>Customer</div>
                            <div className="fw-semibold fs-6">{fmt(getCustomerDisplay(selectedOrder))}</div>
                          </div>
                          <div className="col-6 col-lg-4">
                            <div className="small text-muted mb-1" style={{ letterSpacing: "0.04em" }}>Status</div>
                            <span className={`badge ${getStatusColor(selectedOrder.status)}`}>{fmt(selectedOrder.status)}</span>
                          </div>
                          <div className="col-6 col-lg-4">
                            <div className="small text-muted mb-1" style={{ letterSpacing: "0.04em" }}>Order Date</div>
                            <div className="fw-medium">{formatDate(selectedOrder.order_date || selectedOrder.create_date)}</div>
                          </div>
                          <div className="col-6 col-lg-4">
                            <div className="small text-muted mb-1" style={{ letterSpacing: "0.04em" }}>Order Amount</div>
                            <div className="fw-semibold text-primary">{fmtCurrency(selectedOrder.order_amount)}</div>
                          </div>
                          <div className="col-6 col-lg-4">
                            <div className="small text-muted mb-1" style={{ letterSpacing: "0.04em" }}>Bill Amount</div>
                            <div className="fw-semibold text-success">{fmtCurrency(selectedOrder.bill_amount)}</div>
                          </div>
                          <div className="col-6 col-lg-4">
                            <div className="small text-muted mb-1" style={{ letterSpacing: "0.04em" }}>Items</div>
                            <div className="fw-medium">{selectedOrder.items_count ?? 0} item(s)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.user && (
                      <div className="col-12">
                        <div className="small text-uppercase text-muted fw-semibold mb-2" style={{ letterSpacing: "0.06em" }}>
                          Customer Info
                        </div>
                        <div className="rounded-3 p-3 bg-light">
                          <div className="row g-3">
                            <div className="col-6 col-md-4">
                              <span className="text-muted small">Name</span>
                              <div>{fmt(selectedOrder.user?.name)}</div>
                            </div>
                            <div className="col-6 col-md-4">
                              <span className="text-muted small">Mobile</span>
                              <div>{fmt(selectedOrder.user?.mobile)}</div>
                            </div>
                            <div className="col-6 col-md-4">
                              <span className="text-muted small">Email</span>
                              <div>{fmt(selectedOrder.user?.email)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(selectedOrder.create_by || selectedOrder.modify_by || selectedOrder.success_date || selectedOrder.cancel_date) && (
                      <div className="col-12">
                        <div className="small text-uppercase text-muted fw-semibold mb-2" style={{ letterSpacing: "0.06em" }}>
                          Audit & Timeline
                        </div>
                        <div className="rounded-3 p-3 bg-light">
                          <div className="row g-3">
                            {selectedOrder.create_by && (
                              <div className="col-6 col-md-3">
                                <span className="text-muted small">Created By</span>
                                <div>{fmt(selectedOrder.create_by_user?.name || selectedOrder.create_by)}</div>
                              </div>
                            )}
                            {selectedOrder.modify_by && (
                              <div className="col-6 col-md-3">
                                <span className="text-muted small">Modified By</span>
                                <div>{fmt(selectedOrder.modify_by_user?.name || selectedOrder.modify_by)}</div>
                              </div>
                            )}
                            {selectedOrder.success_date && (
                              <div className="col-6 col-md-3">
                                <span className="text-muted small">Success Date</span>
                                <div className="text-success fw-medium">{formatDate(selectedOrder.success_date)}</div>
                              </div>
                            )}
                            {selectedOrder.cancel_date && (
                              <div className="col-6 col-md-3">
                                <span className="text-muted small">Cancel Date</span>
                                <div className="text-danger fw-medium">{formatDate(selectedOrder.cancel_date)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {(selectedOrder.order_items?.length > 0 || selectedOrder.bill_items?.length > 0) && (
                      <div className="col-12">
                        <div className="small text-uppercase text-muted fw-semibold mb-2" style={{ letterSpacing: "0.06em" }}>
                          Line Items
                        </div>

                        {selectedOrder.order_items?.length > 0 && (
                          <div className="mb-4">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span className="badge bg-primary bg-opacity-10 text-primary">Order Items</span>
                              <span className="small text-muted">{selectedOrder.order_items.length} item(s)</span>
                            </div>
                            <div className="table-responsive rounded-3 overflow-hidden border">
                              <table className="table table-hover table-sm mb-0">
                                <thead style={{ background: "rgba(13,110,253,0.08)" }}>
                                  <tr>
                                    <th>Product</th>
                                    <th>Company</th>
                                    <th>Qty</th>
                                    <th>MRP</th>
                                    <th>Rate</th>
                                    <th>Amount</th>
                                    <th>Deal</th>
                                    <th>Free</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedOrder.order_items.map((oi) => (
                                    <tr key={oi.id}>
                                      <td className="fw-medium">{fmt(oi.product?.name || oi.product_id)}</td>
                                      <td className="text-muted">{fmt(oi.product?.company)}</td>
                                      <td>{fmtNum(oi.qty)}</td>
                                      <td>{fmtCurrency(oi.mrp ?? oi.product?.mrp)}</td>
                                      <td>{fmtCurrency(oi.product?.rate)}</td>
                                      <td className="fw-semibold">{fmtCurrency(oi.amount)}</td>
                                      <td>{fmt(oi.deal ?? oi.product?.deal)}</td>
                                      <td>{fmt(oi.free ?? oi.product?.free)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {selectedOrder.bill_items?.length > 0 && (
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span className="badge bg-success bg-opacity-10 text-success">Bill Items</span>
                              <span className="small text-muted">{selectedOrder.bill_items.length} item(s)</span>
                            </div>
                            <div className="table-responsive rounded-3 overflow-hidden border">
                              <table className="table table-hover table-sm mb-0">
                                <thead style={{ background: "rgba(25,135,84,0.08)" }}>
                                  <tr>
                                    <th>Name</th>
                                    <th>Company</th>
                                    <th>Qty</th>
                                    <th>Free</th>
                                    <th>Pack</th>
                                    <th>Batch</th>
                                    <th>MRP</th>
                                    <th>Rate</th>
                                    <th>Discount %</th>
                                    <th>GST %</th>
                                    <th>Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedOrder.bill_items.map((bi) => (
                                    <tr key={bi.id}>
                                      <td className="fw-medium">{fmt(bi.name)}</td>
                                      <td className="text-muted">{fmt(bi.company)}</td>
                                      <td>{fmtNum(bi.qty)}</td>
                                      <td>{fmtNum(bi.free)}</td>
                                      <td>{fmt(bi.pack)}</td>
                                      <td>{fmt(bi.batch)}</td>
                                      <td>{fmtCurrency(bi.mrp)}</td>
                                      <td>{fmtCurrency(bi.rate)}</td>
                                      <td>{fmtNum(bi.discount_perc)}</td>
                                      <td>{fmtNum(bi.gst_perc)}</td>
                                      <td className="fw-semibold">{fmtCurrency(bi.amount)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {cancelTargetOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
              onClick={() => !cancelLoading && setCancelTargetOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="position-fixed top-50 start-50 translate-middle"
              style={{ width: "min(400px, calc(100% - 24px))", zIndex: 1060 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="card shadow">
                <div className="card-header bg-white d-flex align-items-center justify-content-between">
                  <span className="fw-semibold">Cancel Order</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => !cancelLoading && setCancelTargetOrder(null)}
                    aria-label="Close"
                    disabled={cancelLoading}
                  >
                    <FiX />
                  </button>
                </div>
                <div className="card-body">
                  <p className="mb-0">
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </p>
                  <div className="mt-3 d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => !cancelLoading && setCancelTargetOrder(null)}
                      disabled={cancelLoading}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleCancelOrder}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? "Cancelling..." : "Yes, Cancel Order"}
                    </button>
                  </div>
                </div>
                </div>
              </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orders;
