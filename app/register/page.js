'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main id="main-content" className="container py-5" aria-labelledby="register-heading">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5">
          <div className="page-card">
            <h1 id="register-heading" className="h3 mb-2">Register</h1>
            <p className="text-muted small">Registration page placeholder</p>

            <form onSubmit={(event) => event.preventDefault()}>
              <div className="mb-3">
                <label className="form-label" htmlFor="full-name">Full Name</label>
                <input id="full-name" className="form-control" name="fullName" type="text" autoComplete="name" />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="register-email">Email</label>
                <input id="register-email" className="form-control" name="email" type="email" autoComplete="email" />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="register-password">Password</label>
                <input id="register-password" className="form-control" name="password" type="password" autoComplete="new-password" />
              </div>
              <button type="submit" className="btn btn-primary w-100">Register</button>
            </form>

            <div className="text-center mt-3">
              <Link href="/login" aria-label="Back to login page">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
