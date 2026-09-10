export default function RegisterPage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5">
          <div className="page-card">
            <h1 className="h3 mb-2">Register</h1>
            <p className="text-muted small">Registration page placeholder</p>

            <form>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input className="form-control" type="text" />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" />
              </div>
              <button type="button" className="btn btn-primary w-100">Register</button>
            </form>

            <div className="text-center mt-3">
              <a href="/login">Back to Login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
