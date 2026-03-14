import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiPackage,
  FiTag,
  FiFolder,
  FiSettings,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarPinnedExpanded, setSidebarPinnedExpanded] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const menuItems = useMemo(
    () => [
      { path: "/", label: "Dashboard", icon: FiHome },
      { path: "/users", label: "Users", icon: FiUsers },
      { path: "/orders", label: "Orders", icon: FiShoppingCart },
      { path: "/products", label: "Products", icon: FiPackage },
      { path: "/tags", label: "Tags", icon: FiTag },
      { path: "/categories", label: "Categories", icon: FiFolder },
      { path: "/settings", label: "Settings", icon: FiSettings },
    ],
    [],
  );

  const isActive = (path) => location.pathname === path;
  const isExpanded =
    sidebarPinnedExpanded || (!sidebarPinnedExpanded && sidebarHovered);
  const isCollapsed = !sidebarPinnedExpanded;
  const isHoverOverlay = isCollapsed && sidebarHovered;
  const sidebarBaseWidth = isCollapsed ? 72 : 240;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebarPinnedExpanded");
      if (saved === "true" || saved === "false") {
        setSidebarPinnedExpanded(saved === "true");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "sidebarPinnedExpanded",
        String(sidebarPinnedExpanded),
      );
    } catch (e) {
      // ignore
    }
  }, [sidebarPinnedExpanded]);

  useEffect(() => {
    const handlePointerDown = (e) => {
      if (!profileMenuOpen) return;
      if (!profileMenuRef.current) return;
      if (profileMenuRef.current.contains(e.target)) return;
      setProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [profileMenuOpen]);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    navigate("/login");
  };

  return (
    <div
      className="vh-100 bg-light d-flex flex-column"
      style={{ overflow: "hidden" }}
    >
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div className="container-fluid">
          <button
            type="button"
            className="btn btn-primary d-lg-none me-2"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu />
          </button>
          <span className="navbar-brand mb-0 h1 d-none d-lg-inline">
            Rozi Drugs Admin
          </span>

          <div className="d-flex align-items-center gap-3 text-white ms-auto">
            <div className="small">
              Welcome back, <strong>Admin</strong>
            </div>
            <div className="position-relative" ref={profileMenuRef}>
              <button
                type="button"
                className="btn p-0 border-0 bg-transparent"
                aria-label="Open profile menu"
                onClick={() => setProfileMenuOpen((v) => !v)}
              >
                <div
                  className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center"
                  style={{ width: 36, height: 36, fontWeight: 700 }}
                >
                  A
                </div>
              </button>

              {profileMenuOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end show p-0 border-0"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 10px)",
                  }}
                >
                  <div className="card shadow-sm" style={{ minWidth: 200 }}>
                    <div className="card-body py-2">
                      <div className="fw-semibold">Admin</div>
                      <div className="text-muted small">admin@example.com</div>
                    </div>

                    <div className="list-group list-group-flush">
                      <button
                        type="button"
                        className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/profile");
                        }}
                      >
                        <FiUser />
                        Profile
                      </button>
                      <button
                        type="button"
                        className="list-group-item list-group-item-action d-flex align-items-center gap-2 text-danger"
                        onClick={handleLogout}
                      >
                        <FiLogOut />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div
        className="container-fluid flex-grow-1"
        style={{ overflow: "hidden" }}
      >
        <div
          className="row flex-nowrap h-100 position-relative"
          style={{ overflow: "hidden" }}
        >
          <motion.aside
            className="d-none d-lg-block bg-white border-end p-0"
            animate={{ width: sidebarBaseWidth }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseEnter={() => setSidebarHovered(true)}
            onMouseLeave={() => setSidebarHovered(false)}
            style={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}
          >
            <div className="p-3 border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <div className="fw-bold text-primary text-truncate">
                  {isCollapsed
                    ? isHoverOverlay
                      ? "Rozi Drugs"
                      : ""
                    : "Rozi Drugs"}
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32 }}
                  aria-label={
                    sidebarPinnedExpanded
                      ? "Collapse sidebar"
                      : "Expand sidebar"
                  }
                  onClick={() => setSidebarPinnedExpanded((v) => !v)}
                >
                  {sidebarPinnedExpanded ? (
                    <FiChevronLeft />
                  ) : (
                    <FiChevronRight />
                  )}
                </button>
              </div>
            </div>
            <div className="list-group list-group-flush">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                    isActive(item.path) ? "active" : ""
                  }`}
                >
                  <item.icon />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </motion.aside>

          <AnimatePresence>
            {isHoverOverlay && (
              <motion.aside
                key="sidebar-hover-overlay"
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="d-none d-lg-block bg-white border-end p-0 position-absolute top-0 start-0"
                style={{
                  width: 240,
                  height: "100%",
                  zIndex: 1030,
                  overflowY: "auto",
                  overflowX: "hidden",
                  boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.12)",
                }}
                onMouseEnter={() => setSidebarHovered(true)}
                onMouseLeave={() => setSidebarHovered(false)}
              >
                <div className="p-3 border-bottom">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="fw-bold text-primary text-truncate">
                      Rozi Drugs
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32 }}
                      aria-label={
                        sidebarPinnedExpanded
                          ? "Collapse sidebar"
                          : "Expand sidebar"
                      }
                      onClick={() => setSidebarPinnedExpanded((v) => !v)}
                    >
                      {sidebarPinnedExpanded ? (
                        <FiChevronLeft />
                      ) : (
                        <FiChevronRight />
                      )}
                    </button>
                  </div>
                </div>
                <div className="list-group list-group-flush">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                        isActive(item.path) ? "active" : ""
                      }`}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <main
            className="py-4"
            style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto" }}
          >
            <Outlet />
          </main>
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: "rgba(0,0,0,0.35)", zIndex: 1040 }}
              onClick={() => setSidebarOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="position-fixed top-0 start-0 h-100 bg-white border-end"
              style={{ width: 280, zIndex: 1045 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                <div className="fw-bold text-primary">Menu</div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close"
                >
                  <FiChevronLeft />
                </button>
              </div>

              <div className="list-group list-group-flush">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                      isActive(item.path) ? "active" : ""
                    }`}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
