import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { FiCopy, FiEdit2, FiKey, FiX } from "react-icons/fi";
import { BASE_API_URL } from "../utils/config";

const UserDetails = () => {
  const { username } = useParams();

  const token = useMemo(() => {
    try {
      return localStorage.getItem("admin_token") || "";
    } catch (e) {
      return "";
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [details, setDetails] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    mobile: "",
    customer_id: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.post(
          `${BASE_API_URL}/users/details`,
          {
            username,
          },
          {
            headers: {
              token,
            },
          },
        );

        if (!mounted) return;

        if (res?.data?.error) {
          setError(res?.data?.msg || "Failed to fetch user details");
          setDetails(null);
          return;
        }

        setDetails(res?.data?.data || null);
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.msg ||
            e?.message ||
            "Failed to fetch user details",
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    if (username) fetchDetails();
    return () => {
      mounted = false;
    };
  }, [refreshKey, token, username]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="container-fluid"
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 mb-0">User Profile</h1>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => {
              setStatusError("");
              setShowChangeStatusModal(true);
            }}
            disabled={loading || !details}
          >
            Change Status
          </button>
          <button
            type="button"
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={() => {
              setEditError("");
              setEditForm({
                name: (details?.name || "").toString(),
                email: (details?.email || "").toString(),
                mobile: (details?.mobile || "").toString(),
                customer_id: (details?.customer_id || "").toString(),
              });
              setShowEditModal(true);
            }}
            disabled={loading || !details}
          >
            <FiEdit2 /> Edit Profile
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => {
              setPasswordError("");
              setPasswordSuccess("");
              setPasswordForm({ password: "", confirmPassword: "" });
              setShowChangePasswordModal(true);
            }}
            disabled={!username}
          >
            <FiKey /> Change Password
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3">Details</h2>

              {loading ? (
                <div className="text-muted">Loading...</div>
              ) : !details ? (
                <div className="text-muted">No data</div>
              ) : (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="text-muted small">Name</div>
                    <div className="fw-semibold">{details.name || "-"}</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="text-muted small">Email</div>
                    <div className="fw-semibold">{details.email || "-"}</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="text-muted small">Mobile</div>
                    <div className="fw-semibold">{details.mobile || "-"}</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="text-muted small">Customer ID</div>
                    <div className="fw-semibold">
                      {details.customer_id || "-"}
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="text-muted small">Config Status</div>
                    <span
                      className={`badge ${details.config_status ? "text-bg-success" : "text-bg-secondary"}`}
                    >
                      {details.config_status ? "Configured" : "Not Configured"}
                    </span>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="text-muted small">Account Status</div>
                    <button
                      type="button"
                      className={`badge border-0 ${details.status ? "text-bg-success" : "text-bg-danger"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setStatusError("");
                        setShowChangeStatusModal(true);
                      }}
                    >
                      {details.status ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3">Account</h2>

              {loading ? (
                <div className="text-muted">Loading...</div>
              ) : !details ? (
                <div className="text-muted">No data</div>
              ) : (
                <div className="row g-3">
                  <div className="col-12">
                    <div className="text-muted small">Balance</div>
                    <div className="fw-semibold">
                      {Number(details.balance || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="text-muted small">Created At</div>
                    <div className="fw-semibold">
                      {details.create_date ? String(details.create_date) : "-"}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="text-muted small">
                      Password (from server)
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="fw-semibold">
                        {details.password || "-"}
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                        disabled={!details.password}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              String(details.password || ""),
                            );
                          } catch (e) {
                            // ignore
                          }
                        }}
                      >
                        <FiCopy /> Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
              onClick={() => (editLoading ? null : setShowEditModal(false))}
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="position-fixed top-50 start-50 translate-middle"
              style={{ width: "min(560px, calc(100% - 24px))", zIndex: 1060 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="card shadow">
                <div className="card-header bg-white d-flex align-items-center justify-content-between">
                  <div className="fw-semibold">Edit Profile</div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      editLoading ? null : setShowEditModal(false)
                    }
                    aria-label="Close"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="card-body">
                  {editError && (
                    <div className="alert alert-danger" role="alert">
                      {editError}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, name: e.target.value }))
                        }
                        disabled={editLoading}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Mobile</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.mobile}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, mobile: e.target.value }))
                        }
                        disabled={editLoading}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, email: e.target.value }))
                        }
                        disabled={editLoading}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Customer ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.customer_id}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            customer_id: e.target.value,
                          }))
                        }
                        disabled={editLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-white d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      editLoading ? null : setShowEditModal(false)
                    }
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={editLoading}
                    onClick={async () => {
                      try {
                        setEditLoading(true);
                        setEditError("");

                        const name = (editForm.name || "").toString().trim();
                        const mobile = (editForm.mobile || "")
                          .toString()
                          .trim();
                        const email = (editForm.email || "").toString().trim();
                        const customerId = (editForm.customer_id || "")
                          .toString()
                          .trim();

                        if (!username) {
                          setEditError("Missing username");
                          return;
                        }

                        if (!name || !mobile || !customerId) {
                          setEditError(
                            "Name, mobile and customer id are required",
                          );
                          return;
                        }

                        const res = await axios.post(
                          `${BASE_API_URL}/users/edit`,
                          {
                            username,
                            name,
                            email,
                            mobile,
                            customer_id: customerId,
                          },
                          {
                            headers: {
                              token,
                            },
                          },
                        );

                        if (res?.data?.error) {
                          setEditError(
                            res?.data?.msg || "Failed to update user",
                          );
                          return;
                        }

                        setShowEditModal(false);
                        setRefreshKey((k) => k + 1);
                      } catch (e) {
                        setEditError(
                          e?.response?.data?.msg ||
                            e?.message ||
                            "Failed to update user",
                        );
                      } finally {
                        setEditLoading(false);
                      }
                    }}
                  >
                    {editLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChangePasswordModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
              onClick={() => setShowChangePasswordModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="position-fixed top-50 start-50 translate-middle"
              style={{ width: "min(520px, calc(100% - 24px))", zIndex: 1060 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="card shadow">
                <div className="card-header bg-white d-flex align-items-center justify-content-between">
                  <div className="fw-semibold">Change Password</div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowChangePasswordModal(false)}
                    aria-label="Close"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="card-body">
                  <div className="text-muted small mb-3">
                    User: <strong>{details?.name || username || "-"}</strong>
                  </div>

                  {passwordSuccess && (
                    <div className="alert alert-success" role="alert">
                      {passwordSuccess}
                    </div>
                  )}

                  {passwordError && (
                    <div className="alert alert-danger" role="alert">
                      {passwordError}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">New Password</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={passwordForm.password}
                          onChange={(e) =>
                            setPasswordForm((p) => ({
                              ...p,
                              password: e.target.value,
                            }))
                          }
                          placeholder="Minimum 8 characters"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary d-flex align-items-center gap-2"
                          onClick={() => {
                            const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
                            const lower = "abcdefghjkmnpqrstuvwxyz";
                            const digits = "23456789";
                            const special = "!@#$%&*";
                            const all = upper + lower + digits + special;
                            let pwd =
                              upper[Math.floor(Math.random() * upper.length)] +
                              lower[Math.floor(Math.random() * lower.length)] +
                              digits[Math.floor(Math.random() * digits.length)] +
                              special[Math.floor(Math.random() * special.length)];
                            for (let i = 0; i < 4; i++) {
                              pwd += all[Math.floor(Math.random() * all.length)];
                            }
                            pwd = pwd.split("").sort(() => Math.random() - 0.5).join("");
                            setPasswordForm({
                              password: pwd,
                              confirmPassword: pwd,
                            });
                          }}
                        >
                          Generate
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary d-flex align-items-center gap-2"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                passwordForm.password || "",
                              );
                            } catch (e) {
                              // ignore
                            }
                          }}
                        >
                          <FiCopy /> Copy
                        </button>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="text"
                        className="form-control"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((p) => ({
                            ...p,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-white d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      passwordLoading ? null : setShowChangePasswordModal(false)
                    }
                    disabled={passwordLoading}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={passwordLoading}
                    onClick={async () => {
                      try {
                        setPasswordLoading(true);
                        setPasswordError("");
                        setPasswordSuccess("");

                        const password = (
                          passwordForm.password || ""
                        ).toString();
                        const confirmPassword = (
                          passwordForm.confirmPassword || ""
                        ).toString();

                        if (!username) {
                          setPasswordError("Missing username");
                          return;
                        }

                        if (password.length < 8) {
                          setPasswordError(
                            "Password must be at least 8 characters",
                          );
                          return;
                        }

                        if (password !== confirmPassword) {
                          setPasswordError(
                            "Password and confirm password must match",
                          );
                          return;
                        }

                        const res = await axios.post(
                          `${BASE_API_URL}/users/change-password`,
                          {
                            username,
                            password,
                          },
                          {
                            headers: {
                              token,
                            },
                          },
                        );

                        if (res?.data?.error) {
                          setPasswordError(
                            res?.data?.msg || "Failed to change password",
                          );
                          return;
                        }

                        setPasswordSuccess(
                          res?.data?.msg || "Password changed successfully",
                        );
                        setRefreshKey((k) => k + 1);

                        window.setTimeout(() => {
                          setShowChangePasswordModal(false);
                        }, 500);
                      } catch (e) {
                        setPasswordError(
                          e?.response?.data?.msg ||
                            e?.message ||
                            "Failed to change password",
                        );
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}
                  >
                    {passwordLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChangeStatusModal && details && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
              onClick={() => (statusLoading ? null : setShowChangeStatusModal(false))}
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="position-fixed top-50 start-50 translate-middle"
              style={{ width: "min(400px, calc(100% - 24px))", zIndex: 1060 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="card shadow">
                <div className="card-header bg-white d-flex align-items-center justify-content-between">
                  <div className="fw-semibold">Change Status</div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => (statusLoading ? null : setShowChangeStatusModal(false))}
                    aria-label="Close"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="card-body">
                  <div className="text-muted small mb-3">
                    User: <strong>{details?.name || username || "-"}</strong>
                  </div>
                  <div className="text-muted small mb-3">
                    Current status:{" "}
                    <span
                      className={`badge ${details.status ? "text-bg-success" : "text-bg-danger"}`}
                    >
                      {details.status ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {statusError && (
                    <div className="alert alert-danger" role="alert">
                      {statusError}
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-success flex-grow-1"
                      disabled={statusLoading || details.status}
                      onClick={async () => {
                        try {
                          setStatusLoading(true);
                          setStatusError("");
                          const res = await axios.post(
                            `${BASE_API_URL}/users/change-status`,
                            { username, status: "active" },
                            { headers: { token } },
                          );
                          if (res?.data?.error) {
                            setStatusError(res?.data?.msg || "Failed to update status");
                            return;
                          }
                          setShowChangeStatusModal(false);
                          setRefreshKey((k) => k + 1);
                        } catch (e) {
                          setStatusError(
                            e?.response?.data?.msg || e?.message || "Failed to update status",
                          );
                        } finally {
                          setStatusLoading(false);
                        }
                      }}
                    >
                      {statusLoading ? "..." : "Set Active"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger flex-grow-1"
                      disabled={statusLoading || !details.status}
                      onClick={async () => {
                        try {
                          setStatusLoading(true);
                          setStatusError("");
                          const res = await axios.post(
                            `${BASE_API_URL}/users/change-status`,
                            { username, status: "deactive" },
                            { headers: { token } },
                          );
                          if (res?.data?.error) {
                            setStatusError(res?.data?.msg || "Failed to update status");
                            return;
                          }
                          setShowChangeStatusModal(false);
                          setRefreshKey((k) => k + 1);
                        } catch (e) {
                          setStatusError(
                            e?.response?.data?.msg || e?.message || "Failed to update status",
                          );
                        } finally {
                          setStatusLoading(false);
                        }
                      }}
                    >
                      {statusLoading ? "..." : "Set Inactive"}
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

export default UserDetails;
