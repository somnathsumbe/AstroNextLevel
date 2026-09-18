'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLoggedUser, updateLoggedUser } from '@/lib/auth';
import { applyTheme, getPreferredTheme, saveUserPreferences } from '@/lib/settings';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', username: '', role: '', theme: 'dark-navy' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
      router.replace('/login');
      return;
    }

    setUser(loggedUser);
    setForm({
      name: loggedUser.name || '',
      email: loggedUser.email || '',
      username: loggedUser.username || '',
      role: loggedUser.role || '',
      theme: getPreferredTheme(),
    });
  }, [router]);

  const roleBadge = useMemo(() => {
    if (!user?.role) return 'User';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }, [user]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!user) return;

    const nextUser = {
      ...user,
      name: form.name.trim() || user.name,
      email: form.email.trim() || user.email,
    };

    updateLoggedUser(nextUser);
    saveUserPreferences({ theme: form.theme });
    applyTheme(form.theme);
    setUser(nextUser);
    setMessage({ type: 'success', text: 'Profile updated successfully.' });
  }

  return (
    <div className="profile-page-shell container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="page-card mb-4">
            <div className="profile-header d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
              <div>
                <p className="eyebrow mb-2">USER PROFILE</p>
                <h1 className="page-title mb-0">Profile &amp; Settings</h1>
              </div>
              <Link href="/dashboard" className="btn profile-secondary-btn">Back to Dashboard</Link>
            </div>

            <div className="row g-4 align-items-stretch">
              <div className="col-12 col-lg-4">
                <aside className="profile-summary-card summary-card h-100">
                  <div className="user-avatar large mb-3"><i className="bi bi-person-fill" /></div>
                  <h2 className="profile-user-name mb-1">{user?.name || 'User'}</h2>
                  <div className="profile-user-handle mb-3">@{user?.username || 'unknown'}</div>
                  <span className="profile-role-badge mb-3">{roleBadge}</span>
                  <ul className="profile-meta-list list-unstyled mb-0">
                    <li className="mb-2"><i className="bi bi-envelope me-2" />{user?.email || 'No email found'}</li>
                    <li><i className="bi bi-shield-check me-2" />Status: Active</li>
                  </ul>
                </aside>
              </div>

              <div className="col-12 col-lg-8">
                <form onSubmit={handleSubmit} className="profile-form-card page-card border-0 shadow-none p-0">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full name</label>
                      <input className="profile-form-control form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Username</label>
                      <input className="profile-form-control form-control" value={form.username} disabled readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input type="email" className="profile-form-control form-control" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <input className="profile-form-control form-control" value={form.role} disabled readOnly />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Application theme</label>
                      <select className="profile-form-select form-select" value={form.theme} onChange={(event) => setForm({ ...form, theme: event.target.value })}>
                        <option value="dark-navy">Dark Navy</option>
                        <option value="professional-blue">Professional Blue</option>
                        <option value="astro-purple">Astro Purple</option>
                        <option value="emerald-green">Emerald Green</option>
                        <option value="teal">Teal</option>
                        <option value="sunset-orange">Sunset Orange</option>
                        <option value="light-minimal">Light Minimal</option>
                        <option value="dark-mode">Dark Mode</option>
                      </select>
                    </div>
                  </div>

                  <div className="profile-actions d-flex flex-wrap gap-2 mt-4">
                    <button type="submit" className="btn profile-primary-btn">Save profile</button>
                    <button type="button" className="btn profile-secondary-btn" onClick={() => setForm({ ...form, theme: getPreferredTheme() })}>Reset theme</button>
                  </div>

                  {message && <div className={`profile-alert mt-3 alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-0`} role="status">{message.text}</div>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
