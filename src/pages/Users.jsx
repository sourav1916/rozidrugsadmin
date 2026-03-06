import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
  FiMoreVertical,
  FiUser,
  FiEdit2,
  FiKey,
  FiCopy,
  FiX,
} from "react-icons/fi";
import { BASE_API_URL } from "../utils/config";

const Users = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit] = useState(10);

  const [refreshKey, setRefreshKey] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    mobile: "",
    email: "",
    customer_id: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    name: "",
    mobile: "",
    email: "",
    customer_id: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [actionMenuPos, setActionMenuPos] = useState(null);
  const actionMenuRef = useRef(null);
  const [actionMenuSize, setActionMenuSize] = useState({
    width: 220,
    height: 0,
  });

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordTargetUsername, setPasswordTargetUsername] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    page_no: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
    is_last_page: true,
  });

  const [jumpPage, setJumpPage] = useState("");

  const token = useMemo(() => {
    try {
      return localStorage.getItem("admin_token") || "";
    } catch (e) {
      return "";
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.post(
          `${BASE_API_URL}/users/list`,
          {
            page_no: pageNo,
            limit,
            search,
          },
          {
            headers: {
              token,
            },
          },
        );

        if (!mounted) return;

        if (res?.data?.error) {
          setError(res?.data?.msg || "Failed to fetch users");
          setUsers([]);
          setMeta({
            page_no: 1,
            limit,
            total: 0,
            total_pages: 1,
            is_last_page: true,
          });
          return;
        }

        setUsers(Array.isArray(res?.data?.data) ? res.data.data : []);
        setMeta({
          page_no: Number(res?.data?.meta?.page_no || pageNo),
          limit: Number(res?.data?.meta?.limit || limit),
          total: Number(res?.data?.meta?.total || 0),
          total_pages: Number(res?.data?.meta?.total_pages || 1),
          is_last_page: Boolean(res?.data?.meta?.is_last_page),
        });
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.msg || e?.message || "Failed to fetch users",
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, [limit, pageNo, refreshKey, search, token]);

  useEffect(() => {
    setPageNo(1);
  }, [search]);

  useEffect(() => {
    const handlePointerDown = (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      if (el.closest("[data-users-action-menu-root]")) return;
      if (el.closest("[data-users-action-menu-portal]")) return;
      setOpenActionMenu(null);
      setActionMenuPos(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const handleReposition = () => {
      if (!openActionMenu) return;
      const trigger = document.querySelector(
        `[data-users-action-menu-trigger="${CSS.escape(String(openActionMenu))}"]`,
      );
      if (!(trigger instanceof HTMLElement)) return;
      const rect = trigger.getBoundingClientRect();

      const menuWidth = actionMenuSize.width || 220;
      const menuHeight = actionMenuSize.height || 160;
      const margin = 8;

      let left = rect.right - menuWidth;
      if (left < margin) left = margin;
      if (left + menuWidth > window.innerWidth - margin) {
        left = window.innerWidth - margin - menuWidth;
      }

      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < menuHeight + margin;
      let top = openUp ? rect.top - margin - menuHeight : rect.bottom + margin;
      if (top < margin) top = margin;
      if (top + menuHeight > window.innerHeight - margin) {
        top = window.innerHeight - margin - menuHeight;
      }

      setActionMenuPos({ top, left, openUp });
    };

    handleReposition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [actionMenuSize.height, actionMenuSize.width, openActionMenu]);

  useEffect(() => {
    if (!openActionMenu) return;
    const id = window.requestAnimationFrame(() => {
      if (!actionMenuRef.current) return;
      const rect = actionMenuRef.current.getBoundingClientRect();
      if (!rect.height) return;
      setActionMenuSize({ width: rect.width || 220, height: rect.height });
    });
    return () => window.cancelAnimationFrame(id);
  }, [openActionMenu]);

  const canPrev = meta.page_no > 1;
  const canNext = meta.page_no < meta.total_pages;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container-fluid"
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 d-flex align-items-center gap-2">
          <FiUsers /> Users Management
        </h1>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setAddError("");
            setAddForm({ name: "", mobile: "", email: "", customer_id: "" });
            setCreatedUser(null);
            setShowAddModal(true);
          }}
        >
          <FiPlus /> Add User
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="input-group mb-3">
            <span className="input-group-text">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by username, name, email, customer id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 70 }}>SL</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Customer ID</th>
                  <th className="text-end">Balance</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <motion.tr
                      key={user.username || user.email || user.mobile}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="text-muted">
                        {(meta.page_no - 1) * meta.limit + index + 1}
                      </td>
                      <td className="text-muted">{user.name || "-"}</td>
                      <td className="text-muted">{user.email || "-"}</td>
                      <td className="text-muted">{user.mobile || "-"}</td>
                      <td className="text-muted">
                        {user.config_status ? (
                          user.customer_id || "-"
                        ) : (
                          <span className="text-danger fw-semibold">
                            Not Configured
                          </span>
                        )}
                      </td>
                      <td className="text-end fw-semibold">
                        {Number(user.balance || 0).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${user.status ? "text-bg-success" : "text-bg-danger"}`}
                        >
                          {user.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div
                          className="d-inline-block position-relative"
                          data-users-action-menu-root
                        >
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            aria-label="Actions"
                            data-users-action-menu-trigger={String(
                              user.username || user.email || user.mobile,
                            )}
                            onClick={() =>
                              setOpenActionMenu((v) =>
                                v ===
                                (user.username || user.email || user.mobile)
                                  ? null
                                  : user.username || user.email || user.mobile,
                              )
                            }
                          >
                            <FiMoreVertical />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {openActionMenu &&
            actionMenuPos &&
            createPortal(
              <div
                ref={actionMenuRef}
                data-users-action-menu-portal
                className="dropdown-menu show p-0 border-0"
                style={{
                  position: "fixed",
                  top: actionMenuPos.top,
                  left: actionMenuPos.left,
                  zIndex: 2000,
                  width: actionMenuSize.width || 220,
                }}
              >
                <div className="card shadow-sm">
                  <div className="list-group list-group-flush">
                    <button
                      type="button"
                      className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                      onClick={() => {
                        const target = users.find(
                          (u) =>
                            (u.username || u.email || u.mobile) ===
                            openActionMenu,
                        );
                        setOpenActionMenu(null);
                        setActionMenuPos(null);

                        if (!target?.username) return;
                        navigate(`/user/${target.username}`);
                      }}
                    >
                      <FiUser />
                      Profile
                    </button>
                    <button
                      type="button"
                      className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                      onClick={() => {
                        const target = users.find(
                          (u) =>
                            (u.username || u.email || u.mobile) ===
                            openActionMenu,
                        );
                        setOpenActionMenu(null);
                        setActionMenuPos(null);

                        if (!target) return;
                        setEditError("");
                        setEditForm({
                          username: (target.username || "").toString(),
                          name: (target.name || "").toString(),
                          mobile: (target.mobile || "").toString(),
                          email: (target.email || "").toString(),
                          customer_id: (target.customer_id || "").toString(),
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <FiEdit2 />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                      onClick={() => {
                        const target = users.find(
                          (u) =>
                            (u.username || u.email || u.mobile) ===
                            openActionMenu,
                        );
                        setOpenActionMenu(null);
                        setActionMenuPos(null);

                        if (!target?.username) return;
                        setPasswordError("");
                        setPasswordSuccess("");
                        setPasswordTargetUsername(target.username);
                        setPasswordForm({ password: "", confirmPassword: "" });
                        setShowChangePasswordModal(true);
                      }}
                    >
                      <FiKey />
                      Change Password
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}

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
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
              onClick={() => (addLoading ? null : setShowAddModal(false))}
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
                  <div className="fw-semibold">Add User</div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => (addLoading ? null : setShowAddModal(false))}
                    aria-label="Close"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="card-body">
                  {addError && (
                    <div className="alert alert-danger" role="alert">
                      {addError}
                    </div>
                  )}

                  {createdUser && (
                    <div className="alert alert-success" role="alert">
                      <div className="fw-semibold mb-1">
                        User created successfully
                      </div>
                      <div className="small">
                        Username: <strong>{createdUser.username}</strong>
                      </div>
                      <div className="small">
                        Password: <strong>{createdUser.password}</strong>
                      </div>
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={addForm.name}
                        onChange={(e) =>
                          setAddForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Enter name"
                        disabled={addLoading || Boolean(createdUser)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Mobile</label>
                      <input
                        type="text"
                        className="form-control"
                        value={addForm.mobile}
                        onChange={(e) =>
                          setAddForm((p) => ({ ...p, mobile: e.target.value }))
                        }
                        placeholder="03XXXXXXXXX"
                        disabled={addLoading || Boolean(createdUser)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={addForm.email}
                        onChange={(e) =>
                          setAddForm((p) => ({ ...p, email: e.target.value }))
                        }
                        placeholder="user@example.com"
                        disabled={addLoading || Boolean(createdUser)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Customer ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={addForm.customer_id}
                        onChange={(e) =>
                          setAddForm((p) => ({
                            ...p,
                            customer_id: e.target.value,
                          }))
                        }
                        placeholder="Enter customer id"
                        disabled={addLoading || Boolean(createdUser)}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-white d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => (addLoading ? null : setShowAddModal(false))}
                    disabled={addLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={addLoading}
                    onClick={async () => {
                      try {
                        setAddLoading(true);
                        setAddError("");

                        if (createdUser) {
                          setShowAddModal(false);
                          return;
                        }

                        const name = (addForm.name || "").toString().trim();
                        const mobile = (addForm.mobile || "").toString().trim();
                        const email = (addForm.email || "").toString().trim();
                        const customerId = (addForm.customer_id || "")
                          .toString()
                          .trim();

                        if (!name || !mobile || !email || !customerId) {
                          setAddError("All fields are required");
                          return;
                        }

                        const res = await axios.post(
                          `${BASE_API_URL}/users/create`,
                          {
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
                          setAddError(
                            res?.data?.msg || "Failed to create user",
                          );
                          return;
                        }

                        setCreatedUser(res?.data?.data || null);
                        setRefreshKey((k) => k + 1);
                      } finally {
                        setAddLoading(false);
                      }
                    }}
                  >
                    {createdUser ? "Done" : addLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  <div className="fw-semibold">Edit User</div>
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
                        placeholder="Enter name"
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
                        placeholder="03XXXXXXXXX"
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
                        placeholder="user@example.com"
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
                        placeholder="Enter customer id"
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

                        const username = (editForm.username || "")
                          .toString()
                          .trim();
                        const name = (editForm.name || "").toString().trim();
                        const mobile = (editForm.mobile || "")
                          .toString()
                          .trim();
                        const email = (editForm.email || "").toString().trim();
                        const customerId = (editForm.customer_id || "")
                          .toString()
                          .trim();

                        if (!username) {
                          setEditError("Missing username for this user");
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
                    Username: <strong>{passwordTargetUsername || "-"}</strong>
                  </div>

                  {passwordError && (
                    <div className="alert alert-danger" role="alert">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="alert alert-success" role="alert">
                      {passwordSuccess}
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

                        const username = (passwordTargetUsername || "")
                          .toString()
                          .trim();
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
    </motion.div>
  );
};

export default Users;
