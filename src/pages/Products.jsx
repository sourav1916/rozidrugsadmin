import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FiPackage,
  FiEdit2,
  FiSearch,
  FiFilter,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";
import { BASE_API_URL } from "../utils/config";

const formatExp = (v) => {
  if (v == null || v === "") return "-";
  const s = String(v).trim();
  if (s.length !== 8) return s || "-";
  const year = parseInt(s.slice(0, 4), 10);
  const month = parseInt(s.slice(4, 6), 10) - 1;
  const day = parseInt(s.slice(6, 8), 10);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return s;
  const d = new Date(year, month, day);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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
    <td><SkeletonCell width="80%" /></td>
    <td><SkeletonCell width="70%" /></td>
    <td><SkeletonCell width="2em" /></td>
    <td><SkeletonCell width="50%" /></td>
    <td><SkeletonCell width="50%" /></td>
    <td><SkeletonCell width="2em" /></td>
    <td><SkeletonCell width="2em" /></td>
    <td><SkeletonCell width="60%" /></td>
    <td><SkeletonCell width="4em" /></td>
  </tr>
);

const Products = () => {
  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(20);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({
    page_no: 1,
    limit: 20,
    total: 0,
    pages: 1,
    has_more: false,
    filters: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const payload = {
          page_no: pageNo,
          limit,
          search: search.trim() || undefined,
          categories: categories.length > 0 ? categories : undefined,
          tags: tags.length > 0 ? tags : undefined,
          in_stock_only: inStockOnly || undefined,
          sort: sort || undefined,
        };

        const res = await axios.post(
          `${BASE_API_URL}/product/list`,
          payload,
          { headers: { token } },
        );

        if (!mounted) return;

        if (!res?.data?.success) {
          setError(res?.data?.msg || "Failed to fetch products");
          setProducts([]);
          setMeta({ page_no: 1, limit, total: 0, pages: 1, has_more: false, filters: {} });
          return;
        }

        setProducts(Array.isArray(res?.data?.data) ? res.data.data : []);
        const m = res?.data?.meta || {};
        const total = Number(m.total ?? 0);
        const pages = Number(m.pages ?? 1);
        setMeta({
          page_no: Number(m.page_no ?? pageNo),
          limit: Number(m.limit ?? limit),
          total,
          pages,
          has_more: Boolean(m.has_more),
          filters: m.filters || {},
        });
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.msg || e?.message || "Failed to fetch products");
        setProducts([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchProducts();
    return () => { mounted = false; };
  }, [limit, pageNo, search, categories, tags, inStockOnly, sort, token]);

  useEffect(() => {
    setPageNo(1);
  }, [search, inStockOnly, sort, limit]);

  const canPrev = meta.page_no > 1;
  const canNext = meta.page_no < meta.pages;

  const jumpPageNum = Number(jumpPage);
  const isJumpPageValid =
    Number.isFinite(jumpPageNum) &&
    jumpPageNum >= 1 &&
    jumpPageNum <= Math.max(1, meta.pages);

  const getStockStatusColor = (stock) => {
    const n = Number(stock);
    if (n === 0) return "text-bg-danger";
    if (n < 10) return "text-bg-warning";
    return "text-bg-success";
  };

  const fmtCurrency = (n) => {
    const val = Number(n);
    if (val == null || Number.isNaN(val) || val <= 0) return "-";
    return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container-fluid"
    >
      <div className="mb-4">
        <h1 className="h3 mb-0 d-flex align-items-center gap-2">
          <FiPackage /> Products Management
        </h1>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-3 mb-3">
            <div className="input-group" style={{ maxWidth: 320 }}>
              <span className="input-group-text"><FiSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
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
                <span className="text-muted small align-self-center">per page</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <FiFilter className="text-muted" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="form-select"
                  style={{ maxWidth: 200 }}
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price_asc">Sort: Price (Low to High)</option>
                  <option value="price_desc">Sort: Price (High to Low)</option>
                </select>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="inStockOnly"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="inStockOnly">
                  In stock only
                </label>
              </div>
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
                  <th>Name</th>
                  <th>Company</th>
                  <th>Stock</th>
                  <th>MRP</th>
                  <th>Rate</th>
                  <th>Deal</th>
                  <th>Free</th>
                  <th>Exp</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="placeholder-glow">
                {loading ? (
                  Array.from({ length: 15 }, (_, i) => <SkeletonRow key={i} />)
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-muted">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <motion.tr
                      key={product.id ?? product.product_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="text-muted">
                        {(meta.page_no - 1) * meta.limit + index + 1}
                      </td>
                      <td className="fw-semibold">{product.name || "-"}</td>
                      <td className="text-muted">{product.company || "-"}</td>
                      <td>
                        <span className={`badge ${getStockStatusColor(product.stock)}`}>
                          {product.stock ?? 0}
                        </span>
                      </td>
                      <td className="text-muted">{fmtCurrency(product.mrp)}</td>
                      <td className="text-muted">{fmtCurrency(product.rate)}</td>
                      <td>{product.deal ?? "-"}</td>
                      <td>{product.free ?? "-"}</td>
                      <td className="text-muted">{formatExp(product.exp)}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          aria-label="Edit"
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
                onClick={() => setPageNo((p) => Math.min(meta.pages, p + 1))}
                disabled={!canNext || loading}
              >
                Next <FiChevronRight />
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                onClick={() => setPageNo(meta.pages)}
                disabled={!canNext || loading}
              >
                Last <FiChevronsRight />
              </button>
              <div className="ms-2 text-muted small">
                Page <strong>{meta.page_no}</strong> of <strong>{meta.pages}</strong>
                {meta.total > 0 && (
                  <span className="ms-1">({meta.total.toLocaleString()} items)</span>
                )}
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 ms-md-auto">
              <div className="text-muted small">Jump to page</div>
              <input
                type="number"
                className={`form-control form-control-sm ${jumpPage && !isJumpPageValid ? "is-invalid" : ""}`}
                style={{ width: 110 }}
                min={1}
                max={Math.max(1, meta.pages)}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  if (!isJumpPageValid) return;
                  setPageNo(jumpPageNum);
                }}
                placeholder={`1 - ${meta.pages}`}
                aria-invalid={jumpPage && !isJumpPageValid}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={loading || !isJumpPageValid}
                onClick={() => {
                  if (!isJumpPageValid) return;
                  setPageNo(jumpPageNum);
                }}
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Products;
