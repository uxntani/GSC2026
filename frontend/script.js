/* ============================================================
   script.js — Class2.0
   Sections:
     1. Auth
     2. Theme
     3. Sidebar
     4. Profile Panel
     5. Info Modals (Teachers / Rooms / Classes)
     6. Add Teacher / Room / Class
     7. Generate Schedule + Charts
     8. Clear Data
     9. Init
   ============================================================ */

const API = 'http://localhost:3000';   // ← change if your backend port differs

/* ────────────────────────────────────────────────
   1. AUTH — localStorage-based
   ──────────────────────────────────────────────── */

/* ════════════════════════════════════════════
   TOKEN HELPERS
════════════════════════════════════════════ */
function setToken(token) { localStorage.setItem('class2_token', token); }
function getToken() { return localStorage.getItem('class2_token'); }
function clearToken() { localStorage.removeItem('class2_token'); }

/** Authenticated fetch — attaches Bearer token automatically */
async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
}

/* ════════════════════════════════════════════
   AUTH FORM NAVIGATION
════════════════════════════════════════════ */
let pendingVerifyEmail = ''; // holds email between signup and OTP step

function showLogin() {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('loginForm').classList.add('active');
}
function showSignup() {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('signupForm').classList.add('active');
}
function showOTPForm(email) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('otpEmailDisplay').textContent = email;
  document.getElementById('otpForm').classList.add('active');
}
function showForgotPassword() {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.getElementById('forgotForm').classList.add('active');
}

function setAuthError(formPrefix, msg) {
  document.getElementById(`${formPrefix}Error`).textContent = msg;
}
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : btn.dataset.label || btn.textContent;
}

/* ════════════════════════════════════════════
   SIGNUP
════════════════════════════════════════════ */
async function handleSignup() {
  setAuthError('signup', '');
  const email = document.getElementById('signupEmail').value.trim();
  const universityName = document.getElementById('signupUniversity').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!email || !password) return setAuthError('signup', 'Email and password are required.');
  if (password.length < 6) return setAuthError('signup', 'Password must be at least 6 characters.');

  setLoading('signupBtn', true);
  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, universityName })
    });
    const data = await res.json();
    if (!res.ok) return setAuthError('signup', data.error);

    pendingVerifyEmail = email;
    showOTPForm(email);
  } catch {
    setAuthError('signup', 'Server unreachable. Is your backend running?');
  } finally {
    setLoading('signupBtn', false);
  }
}

/* ════════════════════════════════════════════
   OTP VERIFICATION
════════════════════════════════════════════ */
async function handleVerifyOTP() {
  setAuthError('otp', '');
  const otp = document.getElementById('otpInput').value.trim();
  if (!otp || otp.length !== 6) return setAuthError('otp', 'Enter the 6-digit code.');

  setLoading('otpBtn', true);
  try {
    const res = await fetch(`${API}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingVerifyEmail, otp })
    });
    const data = await res.json();
    if (!res.ok) return setAuthError('otp', data.error);

setToken(data.token);
localStorage.setItem('class2_email', data.email || '');
localStorage.setItem('class2_university', data.universityName || '');
enterApp(data.email, data.universityName);
  } catch {
    setAuthError('otp', 'Verification failed. Try again.');
  } finally {
    setLoading('otpBtn', false);
  }
}

/* ════════════════════════════════════════════
   LOGIN
════════════════════════════════════════════ */
async function handleLogin() {
  setAuthError('login', '');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) return setAuthError('login', 'Both fields are required.');

  setLoading('loginBtn', true);
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return setAuthError('login', data.error);

setToken(data.token);
localStorage.setItem('class2_email', data.email || '');
localStorage.setItem('class2_university', data.universityName || '');
enterApp(data.email, data.universityName);  } catch {
    setAuthError('login', 'Server unreachable. Is your backend running?');
  } finally {
    setLoading('loginBtn', false);
  }
}

/* ════════════════════════════════════════════
   FORGOT PASSWORD
════════════════════════════════════════════ */
async function handleForgotPassword() {
  setAuthError('forgot', '');
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) return setAuthError('forgot', 'Please enter your email.');

  setLoading('forgotBtn', true);
  try {
    const res = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    setAuthError('forgot', data.message || data.error);
  } catch {
    setAuthError('forgot', 'Server unreachable.');
  } finally {
    setLoading('forgotBtn', false);
  }
}

/* ════════════════════════════════════════════
    TOGGLE PASSWORD VISIBILITY
════════════════════════════════════════════ */

function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

/* ════════════════════════════════════════════
   LOGOUT
════════════════════════════════════════════ */
function handleLogout() {
  clearToken();
  localStorage.removeItem('class2_email');
  localStorage.removeItem('class2_university');
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('authScreen').style.display = 'flex';
  showLogin();
}

/* ════════════════════════════════════════════
   ENTER APP
════════════════════════════════════════════ */
function enterApp(email, universityName) {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appScreen').classList.remove('hidden');
  document.getElementById('profileUsername').textContent = email;
  document.getElementById('profileUniversity').value = universityName || '';
}

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
async function init() {
  applyStoredTheme();
  const token = getToken();
  if (!token) {
    document.getElementById('authScreen').style.display = 'flex';
    return;
  }
  // Validate token is still good by hitting a protected route
  try {
    const res = await authFetch(`${API}/teachers`);
    if (res.status === 401 || res.status === 403) {
      clearToken();
      document.getElementById('authScreen').style.display = 'flex';
      return;
    }
    // Token is valid — decode email from JWT payload (it's not sensitive)
    const payload = JSON.parse(atob(token.split('.')[1]));
    enterApp(payload.email || 'User', '');
  } catch {
    document.getElementById('authScreen').style.display = 'flex';
  }
}

init();

/* ────────────────────────────────────────────────
   2. THEME — dark / light toggle
   ──────────────────────────────────────────────── */

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('class2_theme', next);
}

function applyStoredTheme() {
  const saved = localStorage.getItem('class2_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

/* ────────────────────────────────────────────────
   3. SIDEBAR — toggle collapse / mobile
   ──────────────────────────────────────────────── */

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main    = document.querySelector('.main-content');
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('full-width');
  }
}

/* ────────────────────────────────────────────────
   4. PROFILE PANEL — slide in / out
   ──────────────────────────────────────────────── */

function openProfile() {
  document.getElementById('profilePanel').classList.add('open');
  document.getElementById('profileOverlay').classList.add('active');
}

function closeProfile() {
  document.getElementById('profilePanel').classList.remove('open');
  document.getElementById('profileOverlay').classList.remove('active');
}

function saveProfile() {
  const username   = localStorage.getItem('class2_session');
  const university = document.getElementById('profileUniversity').value.trim();

  const users = JSON.parse(localStorage.getItem('class2_users') || '{}');
  if (users[username]) {
    users[username].university = university;
    localStorage.setItem('class2_users', JSON.stringify(users));
    alert('Profile saved ✅');
  }
}

/* ────────────────────────────────────────────────
   5. INFO MODALS — Teachers / Rooms / Classes
   ──────────────────────────────────────────────── */

const MODAL_CONFIG = {
  teachers: {
    title:    'Teacher Info',
    endpoint: '/teachers',
    headers:  ['Name', 'Subject', 'Available Slots', 'Actions'],
    row: (item, idx) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.subject}</td>
        <td>${(item.availableSlots || []).join(', ')}</td>
        <td>
          <button class="delete-btn" onclick="deleteItem('teachers', '${item._id}')">
            <i class="fa fa-trash"></i> Delete
          </button>
        </td>
      </tr>`
  },
  rooms: {
    title:    'Room Info',
    endpoint: '/rooms',
    headers:  ['Room Number', 'Capacity', 'Actions'],
    row: (item, idx) => `
      <tr>
        <td>${item.roomNumber}</td>
        <td>${item.capacity}</td>
        <td>
          <button class="delete-btn" onclick="deleteItem('rooms', '${item._id}')">
            <i class="fa fa-trash"></i> Delete
          </button>
        </td>
      </tr>`
  },
  classes: {
    title:    'Class Info',
    endpoint: '/classes',
    headers:  ['Subject', 'Students', 'Priority', 'Actions'],
    row: (item, idx) => `
      <tr>
        <td>${item.subject}</td>
        <td>${item.students}</td>
        <td>${item.priority}</td>
        <td>
          <button class="delete-btn" onclick="deleteItem('classes', '${item._id}')">
            <i class="fa fa-trash"></i> Delete
          </button>
        </td>
      </tr>`
  }
};

let currentModal = null;   // track which modal is open for re-fetch after delete

async function openModal(type) {
  currentModal = type;
  const cfg  = MODAL_CONFIG[type];
  const modal = document.getElementById('infoModal');
  const body  = document.getElementById('modalBody');

  document.getElementById('modalTitle').textContent = cfg.title;
  body.innerHTML = '<p style="color:var(--text-secondary)">Loading…</p>';
  modal.classList.remove('hidden');

  try {
    const res  = await authFetch(`${API}${cfg.endpoint}`);
    const data = await res.json();

    if (!data.length) {
      body.innerHTML = '<p style="color:var(--text-secondary)">No records found.</p>';
      return;
    }

    const headerCells = cfg.headers.map(h => `<th>${h}</th>`).join('');
    const rows = data.map((item, i) => cfg.row(item, i)).join('');

    body.innerHTML = `
      <table>
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

  } catch (err) {
    body.innerHTML = '<p style="color:var(--danger)">Failed to fetch data.</p>';
    console.error(err);
  }
}

function closeModal() {
  document.getElementById('infoModal').classList.add('hidden');
  currentModal = null;
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('infoModal')) closeModal();
}

/** Delete a single record then re-open the same modal */
async function deleteItem(type, id) {
  if (!confirm('Delete this item?')) return;

  try {
    const res = await authFetch(`${API}/${type}/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    alert(data.message || "Deleted ✅");

    openModal(type); // refresh

  } catch (err) {
    alert("Delete failed ❌");
    console.error(err);
  }
}

/* ────────────────────────────────────────────────
   6. ADD TEACHER / ROOM / CLASS
   ──────────────────────────────────────────────── */

async function addTeacher() {
  const name    = document.getElementById('tName').value.trim();
  const subject = document.getElementById('tSubject').value.trim();
  const slots   = document.getElementById('tSlots').value.split(',').map(s => s.trim());

  if (!name || !subject) return alert('Please fill in Name and Subject.');

  await authFetch(`${API}/teachers/add`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' }, 
    body:    JSON.stringify({ name, subject, availableSlots: slots })
  });

  alert('Teacher Added ✅');
  ['tName','tSubject','tSlots'].forEach(id => document.getElementById(id).value = '');
}

async function addRoom() {
  const roomNumber = document.getElementById('rNumber').value.trim();
  const capacity   = document.getElementById('rCapacity').value;

  if (!roomNumber || !capacity) return alert('Please fill in Room Number and Capacity.');

  await authFetch(`${API}/rooms/add`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ roomNumber, capacity })
  });

  alert('Room Added ✅');
  ['rNumber','rCapacity'].forEach(id => document.getElementById(id).value = '');
}

async function addClass() {
  const subject  = document.getElementById('cSubject').value.trim();
  const students = document.getElementById('cStudents').value;
  const priority = document.getElementById('cPriority').value.trim();

  if (!subject) return alert('Please enter a Subject.');

  await authFetch(`${API}/classes/add`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' }, 
    body:    JSON.stringify({ subject, students, priority })
  });

  alert('Class Added ✅');
  ['cSubject','cStudents','cPriority'].forEach(id => document.getElementById(id).value = '');
}

/* ────────────────────────────────────────────────
   7. GENERATE SCHEDULE + CHARTS
   ──────────────────────────────────────────────── */

let allocationChart = null;
let teacherChart    = null;

async function getSchedule() {
  try {
    const res  = await authFetch(`${API}/allocate`);
    const data = await res.json();
    // 🚨 If no data returned
if (!data || data.length === 0) {
  alert("Couldn't generate - No data found ❌");

  // Hide UI just in case
  document.getElementById('scheduleSection').classList.add('hidden');
  document.getElementById('analyticsSection').classList.add('hidden');

  return;
}

    // ── Populate table ──
    const tbody = document.querySelector('#scheduleTable tbody');
    tbody.innerHTML = '';

    let allocated = 0, failed = 0;
    const teacherCount = {};

    data.forEach(item => {
      const row = document.createElement('tr');

      if (item.message) {
        failed++;
      } else {
        allocated++;
        if (item.teacher) {
          teacherCount[item.teacher] = (teacherCount[item.teacher] || 0) + 1;
        }
      }

      row.innerHTML = `
        <td>${item.subject  || '-'}</td>
        <td>${item.teacher  || '-'}</td>
        <td>${item.room     || '-'}</td>
        <td>${item.time     || '-'}</td>
        <td style="color:${item.message ? '#ff0000' : '#00e817'}">${item.message || 'Allocated'}</td>`;

      tbody.appendChild(row);
    });

    // ── Show sections ──
    document.getElementById('scheduleSection').classList.remove('hidden');
    document.getElementById('analyticsSection').classList.remove('hidden');

    // ── Render two charts ──
    renderAllocationChart(allocated, failed);
    renderTeacherChart(teacherCount);

  } catch (err) {
    alert('Could not reach the server. Is your backend running?');
    console.error(err);
  }
}

/** Chart 1 — Allocated vs Failed (Doughnut) */
function renderAllocationChart(allocated, failed) {
  const ctx = document.getElementById('allocationChart').getContext('2d');
  if (allocationChart) allocationChart.destroy();

  allocationChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Allocated', 'Failed'],
      datasets: [{
        data: [allocated, failed],
        backgroundColor: ['rgba(33, 255, 55, 0.7)', 'rgba(255, 93, 93, 0.7)'],
        borderColor:     ['rgb(13, 255, 37)',   'rgb(255, 70, 70)'],
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: getComputedStyle(document.documentElement)
                              .getPropertyValue('--text-primary').trim() || '#fff' }
        }
      },
      cutout: '65%'
    }
  });
}

/** Chart 2 — Teacher Load (Bar) */
function renderTeacherChart(teacherCount) {
  const ctx = document.getElementById('teacherChart').getContext('2d');
  if (teacherChart) teacherChart.destroy();

  const textColor = getComputedStyle(document.documentElement)
                      .getPropertyValue('--text-primary').trim() || '#fff';

  teacherChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(teacherCount),
      datasets: [{
        label: 'Classes Assigned',
        data:  Object.values(teacherCount),
        backgroundColor: 'rgba(211, 168, 255, 0.6)',
        borderColor:     'rgb(179, 104, 254)',
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: 'rgba(255,255,255,0.08)' } },
        y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.08)' },
             beginAtZero: true }
      }
    }
  });
}

/* ────────────────────────────────────────────────
   8. CLEAR ALL DATA
   ──────────────────────────────────────────────── */

async function clearData() {
  if (!confirm('Clear all teachers, rooms, and classes?')) return;

  await Promise.all([
    authFetch(`${API}/teachers/delete-all`, { method: 'DELETE' }),
    authFetch(`${API}/rooms/delete-all`,    { method: 'DELETE' }),
    authFetch(`${API}/classes/delete-all`,  { method: 'DELETE' })
  ]);

  // Hide schedule + charts
  document.getElementById('scheduleSection').classList.add('hidden');
  document.getElementById('analyticsSection').classList.add('hidden');
  document.querySelector('#scheduleTable tbody').innerHTML = '';

  alert('All data cleared ✅');
}

/* ────────────────────────────────────────────────
   9. INIT — runs on page load
   ──────────────────────────────────────────────── */

async function init() {
  applyStoredTheme();

  const token = getToken();

  // No token stored → show login immediately
  if (!token) {
    document.getElementById('authScreen').style.display = 'flex';
    return;
  }

  // Validate token against a protected route
  try {
    const res = await authFetch(`${API}/teachers`);

    if (res.status === 401 || res.status === 403) {
      // Token expired or invalid — force re-login
      clearToken();
      localStorage.removeItem('class2_email');
      localStorage.removeItem('class2_university');
      document.getElementById('authScreen').style.display = 'flex';
      return;
    }

    // Token is valid — restore session from localStorage
    const email       = localStorage.getItem('class2_email')      || 'User';
    const university  = localStorage.getItem('class2_university')  || '';
    enterApp(email, university);

  } catch {
    // Backend unreachable — still restore UI if token exists
    // (avoids logging out on temporary network hiccup)
    const email       = localStorage.getItem('class2_email')      || 'User';
    const university  = localStorage.getItem('class2_university')  || '';
    enterApp(email, university);
  }
}

init();

/* ────────────────────────────────────────────────
   10. SETTINGS & DELETE ACCOUNT
   ──────────────────────────────────────────────── */

/* ── Settings Modal ── */
function handleSettings() {
  document.getElementById('settingsModal').classList.remove('hidden');
}
function closeSettings() {
  document.getElementById('settingsModal').classList.add('hidden');
}
function closeSettingsOutside(e) {
  if (e.target === document.getElementById('settingsModal')) closeSettings();
}

/* ── Delete Step 1 Modal (password entry) ── */
function openDeleteStep1() {
  closeSettings();
  document.getElementById('deletePassword').value = '';
  document.getElementById('deleteStep1Error').textContent = '';
  document.getElementById('deleteStep1Modal').classList.remove('hidden');
}
function closeDeleteStep1() {
  document.getElementById('deleteStep1Modal').classList.add('hidden');
}
function closeDeleteStep1Outside(e) {
  if (e.target === document.getElementById('deleteStep1Modal')) closeDeleteStep1();
}

/* ── Delete Step 2 Modal (OTP + DELETE confirmation) ── */
function openDeleteStep2() {
  closeDeleteStep1();
  document.getElementById('deleteOTP').value = '';
  document.getElementById('deleteConfirmText').value = '';
  document.getElementById('deleteStep2Error').textContent = '';
  document.getElementById('deleteStep2Modal').classList.remove('hidden');
}
function closeDeleteStep2() {
  document.getElementById('deleteStep2Modal').classList.add('hidden');
}
function closeDeleteStep2Outside(e) {
  if (e.target === document.getElementById('deleteStep2Modal')) closeDeleteStep2();
}

/* ── STEP 1: Verify password → request OTP ── */
async function handleRequestDelete() {
  const errEl = document.getElementById('deleteStep1Error');
  errEl.textContent = '';

  const password = document.getElementById('deletePassword').value;
  if (!password) return (errEl.textContent = 'Password is required.');

  const btn = document.getElementById('deleteStep1Btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>&nbsp; Sending…';

  try {
    const res = await authFetch(`${API}/auth/request-delete`, {
      method: 'POST',
      body: JSON.stringify({ password })
    });
    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.error || 'Something went wrong.';
      return;
    }

    // Success → proceed to step 2
    openDeleteStep2();
  } catch {
    errEl.textContent = 'Server unreachable. Is your backend running?';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-envelope"></i>&nbsp; Send Verification Code';
  }
}

/* ── STEP 2: Submit OTP + "DELETE" → wipe account ── */
async function handleConfirmDelete() {
  const errEl = document.getElementById('deleteStep2Error');
  errEl.textContent = '';

  const otp         = document.getElementById('deleteOTP').value.trim();
  const confirmText = document.getElementById('deleteConfirmText').value.trim();

  if (!otp || otp.length !== 6)
    return (errEl.textContent = 'Enter the 6-digit verification code.');

  if (confirmText !== 'DELETE')
    return (errEl.textContent = 'You must type DELETE exactly (case-sensitive).');

  const btn = document.getElementById('deleteStep2Btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>&nbsp; Deleting…';

  try {
    const res = await authFetch(`${API}/auth/confirm-delete`, {
      method: 'POST',
      body: JSON.stringify({ otp, confirmText })
    });
    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.error || 'Deletion failed.';
      return;
    }

    // Wipe local state and redirect to login
    clearToken();
    localStorage.removeItem('class2_email');
    localStorage.removeItem('class2_university');

    alert('Your account has been permanently deleted. Goodbye 👋');

    document.getElementById('deleteStep2Modal').classList.add('hidden');
    document.getElementById('appScreen').classList.add('hidden');
    document.getElementById('authScreen').style.display = 'flex';
    showLogin();
  } catch {
    errEl.textContent = 'Server unreachable. Try again.';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-skull"></i>&nbsp; Permanently Delete My Account';
  }
}