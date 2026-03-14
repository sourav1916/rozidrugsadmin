import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import {
  FiFolder,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiX,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import { BASE_API_URL } from "../utils/config";

const SkeletonCell = ({ width = "60%" }) => (
  <span
    className="placeholder"
    style={{ width, display: "inline-block", minHeight: "1em" }}
  />
);

const Categories = () => {
  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(20);
  const [categories, setCategories] = useState([]);
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [createdCategory, setCreatedCategory] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ category_id: "", name: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const token = useMemo(() => {
    try {
      return localStorage.getItem("admin_token") || "";
    } catch (e) {
      return "";
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.post(
          `${BASE_API_URL}/category/list`,
          { page_no: pageNo, limit, search: search.trim() || undefined },
          { headers: { token } },
        );

        if (!mounted) return;

        if (res?.data?.error) {
          setError(res?.data?.msg || "Failed to fetch categories");
          setCategories([]);
          setMeta({ page_no: 1, limit, total_items: 0, total_pages: 1, is_last_page: true, has_more: false });
          return;
        }

        setCategories(Array.isArray(res?.data?.data) ? res.data.data : []);
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
        setError(e?.response?.data?.msg || e?.message || "Failed to fetch categories");
        setCategories([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchCategories();
    return () => { mounted = false; };
  }, [limit, pageNo, search, token, refreshKey]);

  useEffect(() => {
    setPageNo(1);
  }, [search]);

  const canPrev = meta.page_no > 1;
  const canNext = meta.page_no < meta.total_pages;

  const handleCreate = async () => {
    const name = (addForm.name || "").toString().trim();
    if (!name) {
      setAddError("Name is required");
      return;
    }
    try {
      setAddLoading(true);
      setAddError("");
      const res = await axios.post(
        `${BASE_API_URL}/category/create`,
        { name },
        { headers: { token } },
      );
      if (res?.data?.error) {
        setAddError(res?.data?.msg || "Failed to create category");
        return;
      }
      setCreatedCategory(res?.data?.data || { category_id: "", name });
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setAddError(e?.response?.data?.msg || e?.message || "Failed to create category");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async () => {
    const category_id = (editForm.category_id || "").toString().trim();
    const name = (editForm.name || "").toString().trim();
    if (!category_id || !name) {
      setEditError("Name is required");
      return;
    }
    try {
      setEditLoading(true);
      setEditError("");
      const res = await axios.post(
        `${BASE_API_URL}/category/edit`,
        { category_id, name },
        { headers: { token } },
      );
      if (res?.data?.error) {
        setEditError(res?.data?.msg || "Failed to update category");
        return;
      }
      setShowEditModal(false);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setEditError(e?.response?.data?.msg || e?.message || "Failed to update category");
    } finally {
      setEditLoading(false);
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
          <FiFolder /> Categories
        </h1>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setAddError("");
            setAddForm({ name: "" });
            setCreatedCategory(null);
            setShowAddModal(true);
          }}
        >
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-3 mb-3">
            <div className="input-group" style={{ maxWidth: 320 }}>
              <span className="input-group-text"><FiSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="form-select"
                style={{ maxWidth: 90 }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-muted small">per page</span>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-3" role="alert">{error}</div>
          )}

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 50 }}>SL</th>
                  <th>Name</th>
                  <th className="text-center">Products</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="placeholder-glow">
                {loading ? (
                  Array.from({ length: 10 }, (_, i) => (
                    <tr key={i}>
                      <td><SkeletonCell width="2em" /></td>
                      <td><SkeletonCell width="60%" /></td>
                      <td><SkeletonCell width="3em" /></td>
                      <td><SkeletonCell width="4em" /></td>
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((category, index) => (
                    <motion.tr key={category.id ?? category.category_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td className="text-muted">
                        {(meta.page_no - 1) * meta.limit + index + 1}
                      </td>
                      <td className="fw-semibold">{category.name || "-"}</td>
                      <td className="text-center text-muted">{category.product_count ?? 0}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          aria-label="Edit"
                          onClick={() => {
                            setEditError("");
                            setEditForm({ category_id: category.category_id, name: category.name || "" });
                            setShowEditModal(true);
                          }}
                        >
                          <FiEdit2 />
                        </button>
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
                onClick={() => setPageNo((p) => Math.min(meta.total_pages, p + 1))}
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
                Page <strong>{meta.page_no}</strong> of <strong>{meta.total_pages}</strong>
                <span className="ms-2">({meta.total_items} total)</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 ms-md-auto">
              <span className="text-muted small">Jump to page</span>
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
                  if (!Number.isFinite(next) || next < 1 || next > meta.total_pages) return;
                  setPageNo(next);
                }}
                placeholder="e.g. 2"
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={loading}
                onClick={() => {
                  const next = Number(jumpPage);
                  if (!Number.isFinite(next) || next < 1 || next > meta.total_pages) return;
                  setPageNo(next);
                }}
              >
                Go
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
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
              onClick={() => !addLoading && setShowAddModal(false)}
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
                  <span className="fw-semibold">Add Category</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => !addLoading && setShowAddModal(false)}
                    aria-label="Close"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="card-body">
                  {addError && (
                    <div className="alert alert-danger" role="alert">{addError}</div>
                  )}
                  {createdCategory && (
                    <div className="alert alert-success" role="alert">
                      Category created successfully: <strong>{createdCategory.name}</strong>
                    </div>
                  )}
                  <div className="mb-0">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addForm.name}
                      onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Enter category name"
                      disabled={addLoading || Boolean(createdCategory)}
                    />
                  </div>
                </div>
                <div className="card-footer bg-white d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => !addLoading && setShowAddModal(false)}
                    disabled={addLoading}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreate}
                    disabled={addLoading || Boolean(createdCategory)}
                  >
                    {addLoading ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {showEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
              onClick={() => !editLoading && setShowEditModal(false)}
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
                  <span className="fw-semibold">Edit Category</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => !editLoading && setShowEditModal(false)}
                    aria-label="Close"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="card-body">
                  {editError && (
                    <div className="alert alert-danger" role="alert">{editError}</div>
                  )}
                  <div className="mb-0">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Enter category name"
                      disabled={editLoading}
                    />
                  </div>
                </div>
                <div className="card-footer bg-white d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => !editLoading && setShowEditModal(false)}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleEdit}
                    disabled={editLoading}
                  >
                    {editLoading ? "Saving..." : "Save"}
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

export default Categories;
