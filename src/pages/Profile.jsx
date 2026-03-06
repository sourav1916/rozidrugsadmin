import React from "react";

const Profile = () => {
  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0">Profile</h1>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="text-muted small">Name</div>
              <div className="fw-semibold">Admin</div>
            </div>
            <div className="col-12 col-md-6">
              <div className="text-muted small">Email</div>
              <div className="fw-semibold">admin@example.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
