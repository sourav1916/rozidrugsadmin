import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiSettings,
  FiSave,
  FiBell,
  FiLock,
  FiUser,
  FiGlobe,
} from "react-icons/fi";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    siteName: "Rozi Drugs Admin",
    siteEmail: "admin@rozidrugs.com",
    timezone: "UTC",
    language: "English",
    notifications: true,
    emailAlerts: false,
    twoFactor: false,
    sessionTimeout: "30",
    currency: "USD",
    taxRate: "10",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const tabs = [
    { id: "general", label: "General", icon: FiGlobe },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "security", label: "Security", icon: FiLock },
    { id: "account", label: "Account", icon: FiUser },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container-fluid"
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 d-flex align-items-center gap-2">
          <FiSettings /> Settings
        </h1>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            {tabs.map((tab) => (
              <li key={tab.id} className="nav-item">
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body">
          {activeTab === "general" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className=""
            >
              <div className="row g-3">
                <div>
                  <label className="form-label">Site Name</label>
                  <input
                    type="text"
                    name="siteName"
                    value={formData.siteName}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="form-label">Site Email</label>
                  <input
                    type="email"
                    name="siteEmail"
                    value={formData.siteEmail}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div>
                  <label className="form-label">Timezone</label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className=""
            >
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleInputChange}
                  id="notificationsSwitch"
                />
                <label
                  className="form-check-label"
                  htmlFor="notificationsSwitch"
                >
                  Enable Notifications
                </label>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  name="emailAlerts"
                  checked={formData.emailAlerts}
                  onChange={handleInputChange}
                  id="emailAlertsSwitch"
                />
                <label className="form-check-label" htmlFor="emailAlertsSwitch">
                  Email Alerts
                </label>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className=""
            >
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  name="twoFactor"
                  checked={formData.twoFactor}
                  onChange={handleInputChange}
                  id="twoFactorSwitch"
                />
                <label className="form-check-label" htmlFor="twoFactorSwitch">
                  Two-Factor Authentication
                </label>
              </div>

              <div className="mb-3">
                <label className="form-label">Session Timeout (minutes)</label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={formData.sessionTimeout}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className=""
            >
              <div className="row g-3">
                <div>
                  <label className="form-label">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="PKR">PKR</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="d-flex justify-content-end mt-4">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2"
            >
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
