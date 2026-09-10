'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticate } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const rememberedUsername = window.localStorage.getItem('astro_remember_login');
    if (rememberedUsername) setForm((current) => ({ ...current, username: rememberedUsername }));
    const timer = message ? window.setTimeout(() => setMessage(null), 4500) : undefined;
    return () => window.clearTimeout(timer);
  }, [message]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.username.trim() || !form.password) {
      setMessage({ type: 'error', text: 'Enter your username and password.' });
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      const result = authenticate(form.username.trim(), form.password);
      if (!result.ok) {
        setLoading(false);
        setMessage({ type: 'error', text: result.reason === 'inactive' ? 'Your account is inactive. Please contact administrator.' : 'Invalid username or password.' });
        return;
      }
      if (rememberMe) {
        window.localStorage.setItem('astro_remember_login', form.username.trim());
      } else {
        window.localStorage.removeItem('astro_remember_login');
      }
      router.replace('/dashboard');
    }, 450);
  }

  return (
    <main className="login-page">
      <div className="login-stars" />
      <div className="login-container">
        <div className="login-intro">
          <a className="login-logo" href="/login"><span className="brand-star">✦</span><span><strong>ASTRO</strong><small>MARKET ANALYTICS</small></span></a>
          <p className="eyebrow">PLANETARY INTELLIGENCE PLATFORM</p>
          <h1>Read the sky.<br /><em>Read the market.</em></h1>
          <p className="login-copy">A precision workspace for studying planetary cycles alongside NSE and BSE market movements.</p>
          <div className="astrology-visual" aria-hidden="true">
            <div className="orbit orbit-one"><span>☉</span></div><div className="orbit orbit-two"><span>♄</span></div>
            <div className="zodiac-wheel">♈︎　♉︎　♊︎　♋︎<br /><span>☽　✦　☿</span><br />♌︎　♍︎　♎︎　♏︎</div>
            <div className="chart-line" />
            <div className="visual-caption"><span className="live-dot" /> MARKET SIGNALS / CELESTIAL CYCLES</div>
          </div>
        </div>

        <section className="login-panel" aria-labelledby="login-heading">
          <div className="panel-kicker">SECURE ACCESS <span>•</span> ADMIN CONSOLE</div>
          <h2 id="login-heading">Welcome back</h2>
          <p className="panel-subtitle">Sign in to your intelligence workspace.</p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field"><label htmlFor="username">Username</label><div className="input-wrap"><i className="bi bi-person" /><input id="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} autoComplete="username" placeholder="Enter username" /></div></div>
            <div className="login-field"><label htmlFor="password">Password</label><div className="input-wrap"><i className="bi bi-lock" /><input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" placeholder="Enter password" /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}><i className={`bi bi-eye${showPassword ? '-slash' : ''}`} /></button></div></div>
            <label className="remember-login"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> <span>Remember Me</span></label>
            <button className="login-submit" type="submit" disabled={loading}>{loading ? <><span className="spinner-border spinner-border-sm" /> Signing in...</> : <>LOGIN <i className="bi bi-arrow-up-right" /></>}</button>
          </form>
          <div className="panel-footer"><i className="bi bi-shield-check" /> Protected local workspace <span>v1.0</span></div>
        </section>
      </div>
      <div className="login-bottomline">ASTROLOGY × MARKET INTELLIGENCE <span>•</span> RESEARCH CONSOLE</div>
      {message && <div className="toast-message error" role="alert"><i className="bi bi-exclamation-circle" /> {message.text}</div>}
    </main>
  );
}
