import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_API_URL } from "../utils/config";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ emailOrMobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const identifier = (formData.emailOrMobile || "").toString().trim();
      const password = (formData.password || "").toString();

      const isEmail = identifier.includes("@");

      const payload = {
        password,
        ...(isEmail ? { email: identifier } : { mobile: identifier }),
      };

      const res = await axios.post(`${BASE_API_URL}/auth/login`, payload);

      const success = Boolean(res?.data?.success);
      if (!success) {
        setError(res?.data?.msg || "Login failed");
        return;
      }

      const data = res?.data?.data || {};

      localStorage.setItem("admin_auth", JSON.stringify(res.data));
      if (data?.token) localStorage.setItem("admin_token", String(data.token));
      if (data?.name) localStorage.setItem("admin_name", String(data.name));
      if (data?.username)
        localStorage.setItem("admin_username", String(data.username));

      navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="mb-3 text-center">
                  <h1 className="h4 mb-1">Rozi Drugs Admin</h1>
                  <div className="text-muted">Sign in to continue</div>
                </div>

                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Email or Mobile</label>
                    <input
                      type="text"
                      className="form-control"
                      name="emailOrMobile"
                      value={formData.emailOrMobile}
                      onChange={handleChange}
                      placeholder="admin@example.com or 03XXXXXXXXX"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <Link to="/" className="text-decoration-none small">
                    Back to dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
