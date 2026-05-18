/* =====================================================
   ARUBA NETWORKS — AUTH UI  |  app.js
   Handles: tab switching, validation, animations,
            password strength, neural-net canvas
   ===================================================== */

/* ── Neural-network canvas animation ─────────────────── */
(function initNeuralCanvas() {
  const canvas = document.getElementById("neuralCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, nodes = [], rafId;
  const NODE_COUNT = 55;
  const MAX_DIST   = 160;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 2 + 1.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update positions
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.22;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 107, 0, ${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 130, 40, 0.55)";
      ctx.fill();
    });

    rafId = requestAnimationFrame(draw);
  }

  resize();
  createNodes();
  draw();

  window.addEventListener("resize", () => {
    resize();
    createNodes();
  });
})();

/* ── AI greeting rotator ─────────────────────────────── */
const AI_MESSAGES = [
  "AI Security Scan: Active ✓",
  "Zero-Trust Policy: Enforced ✓",
  "Threat Intelligence: Live ✓",
  "AIOps Engine: Running ✓",
  "Network Health: Optimal ✓",
];
let aiIdx = 0;

(function rotateAiGreeting() {
  const el = document.getElementById("aiGreetingText");
  if (!el) return;
  setInterval(() => {
    aiIdx = (aiIdx + 1) % AI_MESSAGES.length;
    el.style.opacity = "0";
    el.style.transform = "translateY(-6px)";
    setTimeout(() => {
      el.textContent = AI_MESSAGES[aiIdx];
      el.style.transition = "opacity 0.4s, transform 0.4s";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 350);
  }, 2800);
})();

/* ── Tab switching ───────────────────────────────────── */
/**
 * Switches between login and signup tabs.
 * @param {"login"|"signup"} tab
 */
function switchTab(tab) {
  const loginForm  = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const tabLogin   = document.getElementById("tabLogin");
  const tabSignup  = document.getElementById("tabSignup");
  const indicator  = document.getElementById("tabIndicator");

  // Animate out
  const activeForm = document.querySelector(".auth-form.active");
  if (activeForm) {
    activeForm.style.opacity = "0";
    activeForm.style.transform = "translateY(10px) scale(0.98)";
  }

  setTimeout(() => {
    if (tab === "login") {
      loginForm.classList.add("active");
      signupForm.classList.remove("active");
      tabLogin.classList.add("active");
      tabLogin.setAttribute("aria-selected", "true");
      tabSignup.classList.remove("active");
      tabSignup.setAttribute("aria-selected", "false");
      indicator.classList.remove("right");
    } else {
      signupForm.classList.add("active");
      loginForm.classList.remove("active");
      tabSignup.classList.add("active");
      tabSignup.setAttribute("aria-selected", "true");
      tabLogin.classList.remove("active");
      tabLogin.setAttribute("aria-selected", "false");
      indicator.classList.add("right");
    }

    // Animate in
    const newForm = document.querySelector(".auth-form.active");
    newForm.style.opacity = "0";
    newForm.style.transform = "translateY(10px) scale(0.98)";
    newForm.style.transition = "none";
    requestAnimationFrame(() => {
      newForm.style.transition = "opacity 0.35s ease, transform 0.35s ease";
      newForm.style.opacity = "1";
      newForm.style.transform = "none";
    });
  }, 180);
}

/* ── Password visibility toggle ─────────────────────── */
/**
 * Toggles password field between text and password type.
 * @param {string} fieldId
 * @param {HTMLButtonElement} btn
 */
function togglePwd(fieldId, btn) {
  const input = document.getElementById(fieldId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");

  // Swap icon
  const svg = btn.querySelector("svg");
  if (isHidden) {
    // Crossed-eye icon (password visible)
    svg.innerHTML = `
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M3 3l14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    `;
    btn.style.color = "var(--aruba-orange)";
  } else {
    svg.innerHTML = `
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
    `;
    btn.style.color = "";
  }
}

/* ── Password strength meter ─────────────────────────── */
/**
 * Updates the strength meter UI based on password value.
 * @param {string} val
 */
function updateStrength(val) {
  const fill  = document.getElementById("strengthFill");
  const label = document.getElementById("strengthLabel");
  if (!fill || !label) return;

  let score = 0;
  if (val.length >= 8)                        score++;
  if (/[A-Z]/.test(val))                      score++;
  if (/[0-9]/.test(val))                      score++;
  if (/[^A-Za-z0-9]/.test(val))              score++;
  if (val.length >= 14)                        score++;

  const levels = [
    { pct: "0%",   color: "transparent",                            text: "Enter password" },
    { pct: "25%",  color: "#ff4d4d",                                text: "Weak" },
    { pct: "50%",  color: "#ff9900",                                text: "Fair" },
    { pct: "75%",  color: "#f5d800",                                text: "Good" },
    { pct: "90%",  color: "#36d399",                                text: "Strong" },
    { pct: "100%", color: "#00e5a0",                                text: "Very Strong 🔒" },
  ];

  const lvl = val.length === 0 ? levels[0] : levels[Math.min(score, 5)];
  fill.style.width      = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent     = lvl.text;
  label.style.color     = score >= 3 ? "var(--text-success)" : score >= 2 ? "#ff9900" : "var(--text-error)";
  if (val.length === 0) label.style.color = "var(--text-muted)";
}

/* ── Validation helpers ──────────────────────────────── */
/**
 * Validates an email string.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Sets a field group's error or valid state.
 * @param {string} groupId
 * @param {string} errorId
 * @param {string} msg  - empty string clears error
 */
function setFieldState(groupId, errorId, msg) {
  const group = document.getElementById(groupId);
  const err   = document.getElementById(errorId);
  if (!group || !err) return;

  if (msg) {
    group.classList.add("has-error");
    group.classList.remove("is-valid");
    err.textContent = "⚠ " + msg;
  } else {
    group.classList.remove("has-error");
    group.classList.add("is-valid");
    err.textContent = "";
  }
}

/* ── Toast utility ───────────────────────────────────── */
let toastTimer;
/**
 * Shows a transient toast message.
 * @param {string} msg
 * @param {"success"|"error"|"info"} type
 */
function showToast(msg, type = "info") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  toastTimer = setTimeout(() => {
    toast.className = "toast";
  }, 3200);
}

/* ── Button loading state ────────────────────────────── */
function setLoading(btnId, on) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (on) {
    btn.classList.add("loading");
    btn.disabled = true;
  } else {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

/* ── LOGIN form handler ──────────────────────────────── */
/**
 * Validates and submits the login form.
 * @param {Event} e
 */
async function handleLogin(e) {
  e.preventDefault();
  let valid = true;

  const email    = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // Email validation
  if (!email.trim()) {
    setFieldState("loginEmailGroup", "loginEmailError", "Email address is required.");
    valid = false;
  } else if (!isValidEmail(email)) {
    setFieldState("loginEmailGroup", "loginEmailError", "Please enter a valid email address.");
    valid = false;
  } else {
    setFieldState("loginEmailGroup", "loginEmailError", "");
  }

  // Password validation
  if (!password) {
    setFieldState("loginPasswordGroup", "loginPasswordError", "Password is required.");
    valid = false;
  } else if (password.length < 6) {
    setFieldState("loginPasswordGroup", "loginPasswordError", "Password must be at least 6 characters.");
    valid = false;
  } else {
    setFieldState("loginPasswordGroup", "loginPasswordError", "");
  }

  if (!valid) return;

  // Simulate async auth request
  setLoading("loginBtn", true);
  await delay(1600);
  setLoading("loginBtn", false);
  showToast("✅ Signed in successfully! Redirecting…", "success");

  // Reset after demo
  setTimeout(() => document.getElementById("loginForm").reset(), 2000);
}

/* ── SIGNUP form handler ─────────────────────────────── */
/**
 * Validates all signup fields and submits the form.
 * @param {Event} e
 */
async function handleSignup(e) {
  e.preventDefault();
  let valid = true;

  const firstName  = document.getElementById("firstName").value.trim();
  const lastName   = document.getElementById("lastName").value.trim();
  const email      = document.getElementById("signupEmail").value.trim();
  const password   = document.getElementById("signupPassword").value;
  const confirm    = document.getElementById("confirmPassword").value;
  const agreeTerms = document.getElementById("agreeTerms").checked;

  // First name
  if (!firstName) {
    setFieldState("firstNameGroup", "firstNameError", "First name is required.");
    valid = false;
  } else if (firstName.length < 2) {
    setFieldState("firstNameGroup", "firstNameError", "Must be at least 2 characters.");
    valid = false;
  } else {
    setFieldState("firstNameGroup", "firstNameError", "");
  }

  // Last name
  if (!lastName) {
    setFieldState("lastNameGroup", "lastNameError", "Last name is required.");
    valid = false;
  } else {
    setFieldState("lastNameGroup", "lastNameError", "");
  }

  // Email
  if (!email) {
    setFieldState("signupEmailGroup", "signupEmailError", "Work email is required.");
    valid = false;
  } else if (!isValidEmail(email)) {
    setFieldState("signupEmailGroup", "signupEmailError", "Enter a valid email address.");
    valid = false;
  } else {
    setFieldState("signupEmailGroup", "signupEmailError", "");
  }

  // Password
  if (!password) {
    setFieldState("signupPasswordGroup", "signupPasswordError", "Password is required.");
    valid = false;
  } else if (password.length < 8) {
    setFieldState("signupPasswordGroup", "signupPasswordError", "Password must be at least 8 characters.");
    valid = false;
  } else {
    setFieldState("signupPasswordGroup", "signupPasswordError", "");
  }

  // Confirm password
  if (!confirm) {
    setFieldState("confirmPasswordGroup", "confirmPasswordError", "Please confirm your password.");
    valid = false;
  } else if (confirm !== password) {
    setFieldState("confirmPasswordGroup", "confirmPasswordError", "Passwords do not match.");
    valid = false;
  } else {
    setFieldState("confirmPasswordGroup", "confirmPasswordError", "");
  }

  // Terms
  const termsErr = document.getElementById("agreeTermsError");
  if (!agreeTerms) {
    termsErr.textContent = "⚠ You must accept the Terms of Service.";
    valid = false;
  } else {
    termsErr.textContent = "";
  }

  if (!valid) return;

  // Simulate async account creation
  setLoading("signupBtn", true);
  await delay(1800);
  setLoading("signupBtn", false);
  showToast(`🎉 Account created for ${firstName}! Welcome to Aruba Networks.`, "success");

  setTimeout(() => {
    document.getElementById("signupForm").reset();
    updateStrength(""); // reset strength meter
    switchTab("login");
  }, 2200);
}

/* ── Social login ────────────────────────────────────── */
/**
 * Handles third-party OAuth social logins.
 * @param {"Google"|"Microsoft"} provider
 */
function socialLogin(provider) {
  showToast(`Redirecting to ${provider} sign-in…`, "info");
}

/* ── Forgot password ─────────────────────────────────── */
/**
 * Triggers forgot-password flow.
 * @param {Event} e
 */
function forgotPassword(e) {
  e.preventDefault();
  showToast("📧 Password reset link sent to your email.", "success");
}

/* ── Utility: async delay ────────────────────────────── */
/**
 * Returns a promise that resolves after `ms` milliseconds.
 * @param {number} ms
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
