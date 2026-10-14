import React, { useCallback, useEffect, useState } from 'react';
import {
  clearToken,
  createPrintJob,
  deletePrintJob,
  getPrintJobs,
  getPrintShops,
  getRole,
  getToken,
  login,
  updatePrintJobStatus
} from './services/apiClient';
import './style.css';

const emptyJob = {
  customer_name: '',
  file_name: '',
  pages: 1,
  copies: 1,
  color_mode: 'bw',
  shop_id: 1
};

function App() {
  const [token, setToken] = useState(() => getToken());
  const [role, setRole] = useState(() => getRole());
  const [email, setEmail] = useState('staff@printshop.local');
  const [password, setPassword] = useState('');
  const [jobs, setJobs] = useState([]);
  const [shops, setShops] = useState([]);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');

  const refresh = useCallback(async () => {
    const [jobData, shopData] = await Promise.all([
      getPrintJobs(),
      getPrintShops()
    ]);
    setJobs(jobData);
    setShops(shopData);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setRole(null);
      setJobs([]);
      setError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [jobData, shopData] = await Promise.all([
          getPrintJobs(),
          getPrintShops()
        ]);
        if (active) {
          setJobs(jobData);
          setShops(shopData);
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    load();
    return () => { active = false; };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    try {
      const result = await login(email, password);
      setToken(result.token);
      setRole(result.role);
      setPassword('');
      await refresh();
      setNotice('เข้าสู่ระบบสำเร็จ');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearToken();
    setToken(null);
    setRole(null);
    setPassword('');
    setNotice('ออกจากระบบแล้ว');
    setError('');
  }

  async function handleCreate(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    try {
      await createPrintJob({
        ...jobForm,
        pages: Number(jobForm.pages),
        copies: Number(jobForm.copies),
        shop_id: Number(jobForm.shop_id)
      });
      setJobForm(emptyJob);
      await refresh();
      setNotice('สร้างรายการงานพิมพ์สำเร็จ');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleStatus(job, status) {
    setError('');
    setNotice('');

    try {
      await updatePrintJobStatus(job.id, status);
      await refresh();
      setNotice(`อัปเดตสถานะงาน #${job.id} สำเร็จ`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(job) {
    if (!window.confirm(`ยืนยันลบงานพิมพ์ #${job.id} หรือไม่?`)) return;

    setError('');
    setNotice('');

    try {
      await deletePrintJob(job.id);
      await refresh();
      setNotice(`ลบงาน #${job.id} สำเร็จ`);
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleJobs = filter === 'all'
    ? jobs
    : jobs.filter(job => job.status === filter);

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div>
            <p className="eyebrow">TEAM T15</p>
            <h1>Print Jobs</h1>
          </div>
        </div>
        <span className="api-status"><span /> Print service</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow light">CAMPUS PRINTING SERVICE</p>
          <h2>จัดการงานพิมพ์<br />ได้ในที่เดียว</h2>
          <p>ติดตามรายการ สร้างงานใหม่ และจัดการสถานะงานพิมพ์</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="paper paper-back" />
          <div className="paper paper-front">
            <span />
            <span />
            <span />
            <strong>PRINT</strong>
          </div>
        </div>
      </section>

      {error && <div className="alert error" role="alert">{error}</div>}
      {notice && <div className="alert success" role="status">{notice}</div>}

      {!token ? (
        <section className="panel login-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WELCOME BACK</p>
              <h2>เข้าสู่ระบบ</h2>
              <p className="muted">เข้าสู่ระบบเพื่อจัดการงานพิมพ์ของคุณ</p>
            </div>
            <div className="icon-box">↗</div>
          </div>

          <form className="form-grid" onSubmit={handleLogin}>
            <label>
              อีเมล
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="username"
                required
              />
            </label>
            <label>
              รหัสผ่าน
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="กรอกรหัสผ่าน"
                autoComplete="current-password"
                required
              />
            </label>
            <button className="primary-button full" disabled={busy} type="submit">
              {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="hint">บัญชี Staff สำหรับทดสอบ: staff@printshop.local</p>
        </section>
      ) : (
        <section className="panel account-bar">
          <div>
            <p className="eyebrow">SIGNED IN</p>
            <strong>{role === 'staff' ? 'เจ้าหน้าที่ (Staff)' : 'ผู้ใช้ (Customer)'}</strong>
            <p className="muted">ระบบกำลังใช้สิทธิ์ตามบัญชีที่เข้าสู่ระบบ</p>
          </div>
          <button className="secondary-button" onClick={logout}>ออกจากระบบ</button>
        </section>
      )}

      <section className="stats">
        <article className="stat-card">
          <span className="stat-icon blue">▤</span>
          <p>งานทั้งหมด</p>
          <strong>{jobs.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon amber">◷</span>
          <p>รอดำเนินการ</p>
          <strong>{jobs.filter(job => job.status === 'queued').length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon green">✓</span>
          <p>เสร็จแล้ว</p>
          <strong>{jobs.filter(job => job.status === 'completed').length}</strong>
        </article>
      </section>

      <section className="content-grid">
        <section className="panel jobs-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h2>รายการงานพิมพ์</h2>
              <p className="muted">ข้อมูลล่าสุดจากระบบ</p>
            </div>
            <button className="secondary-button" onClick={() => refresh().catch(err => setError(err.message))}>
              ↻ รีเฟรช
            </button>
          </div>

          <div className="filter-row">
            <label htmlFor="job-filter">สถานะ</label>
            <select id="job-filter" value={filter} onChange={event => setFilter(event.target.value)}>
              <option value="all">ทั้งหมด</option>
              <option value="queued">รอดำเนินการ</option>
              <option value="printing">กำลังพิมพ์</option>
              <option value="completed">เสร็จแล้ว</option>
            </select>
          </div>

          {visibleJobs.length === 0 ? (
            <div className="empty-state">
              <span>▤</span>
              <strong>ยังไม่มีรายการงาน</strong>
              <p>ลองเปลี่ยนตัวกรองหรือรีเฟรชข้อมูล</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>งาน</th>
                    <th>รายละเอียด</th>
                    <th>สถานะ</th>
                    {role === 'staff' && <th>จัดการ</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleJobs.map(job => (
                    <tr key={job.id}>
                      <td>
                        <strong>#{job.id}</strong>
                        <small>{job.customer_name}</small>
                      </td>
                      <td>
                        <strong className="file-name">{job.file_name}</strong>
                        <small>{job.pages} หน้า · {job.copies} ชุด · {job.color_mode === 'color' ? 'สี' : 'ขาวดำ'}</small>
                      </td>
                      <td>
                        <span className={`status status-${job.status}`}>
                          {job.status === 'queued' ? 'รอคิว' : job.status === 'printing' ? 'กำลังพิมพ์' : job.status === 'completed' ? 'เสร็จแล้ว' : job.status}
                        </span>
                      </td>
                      {role === 'staff' && (
                        <td>
                          <div className="action-stack">
                            <select
                              aria-label={`สถานะงาน ${job.id}`}
                              value={job.status}
                              onChange={event => handleStatus(job, event.target.value)}
                            >
                              <option value="queued">รอคิว</option>
                              <option value="printing">กำลังพิมพ์</option>
                              <option value="completed">เสร็จแล้ว</option>
                            </select>
                            <button className="delete-button" onClick={() => handleDelete(job)}>ลบ</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel create-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NEW REQUEST</p>
              <h2>สร้างงานพิมพ์</h2>
              <p className="muted">กรอกรายละเอียดงานใหม่</p>
            </div>
            <div className="icon-box">＋</div>
          </div>

          <form className="form-grid" onSubmit={handleCreate}>
            <label>
              ชื่อลูกค้า
              <input
                value={jobForm.customer_name}
                onChange={event => setJobForm({ ...jobForm, customer_name: event.target.value })}
                required
                maxLength={100}
                placeholder="ชื่อผู้สั่งพิมพ์"
              />
            </label>
            <label>
              ชื่อไฟล์
              <input
                value={jobForm.file_name}
                onChange={event => setJobForm({ ...jobForm, file_name: event.target.value })}
                required
                maxLength={255}
                placeholder="document.pdf"
              />
            </label>
            <div className="two-fields">
              <label>
                จำนวนหน้า
                <input type="number" min="1" max="200" value={jobForm.pages}
                  onChange={event => setJobForm({ ...jobForm, pages: event.target.value })} required />
              </label>
              <label>
                จำนวนชุด
                <input type="number" min="1" max="20" value={jobForm.copies}
                  onChange={event => setJobForm({ ...jobForm, copies: event.target.value })} required />
              </label>
            </div>
            <label>
              ร้านพิมพ์
              <select value={jobForm.shop_id}
                onChange={event => setJobForm({ ...jobForm, shop_id: event.target.value })}>
                {shops.length === 0 && <option value="1">ร้านพิมพ์ #1</option>}
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name} — {shop.building}</option>
                ))}
              </select>
            </label>
            <label>
              รูปแบบสี
              <select value={jobForm.color_mode}
                onChange={event => setJobForm({ ...jobForm, color_mode: event.target.value })}>
                <option value="bw">ขาวดำ</option>
                <option value="color">สี</option>
              </select>
            </label>
            <button className="primary-button full" disabled={busy} type="submit">
              {busy ? 'กำลังบันทึก...' : '＋ สร้างงานพิมพ์'}
            </button>
          </form>
        </section>
      </section>

      <footer>ENGSE203 · T15 Print Jobs Management</footer>
    </main>
  );
}

export default App;
