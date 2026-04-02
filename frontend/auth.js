function showToast(message) {
  const toastMessage = document.getElementById('toastMessage');
  toastMessage.textContent = message;
  toastMessage.classList.remove('hidden');
  setTimeout(() => {
    toastMessage.classList.add('hidden');
  }, 2500);
}

async function apiRequest(path, method, body) {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function handleAuth(mode) {
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showToast('Email and password are required.');
    return;
  }

  try {
    const endpoint = mode === 'signup' ? '/api/users/signup' : '/api/users/login';
    const result = await apiRequest(endpoint, 'POST', { email, password });

    localStorage.setItem('coursePlannerUser', JSON.stringify(result.user));
    window.location.href = 'planner.html';
  } catch (error) {
    showToast(error.message);
  }
}

const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

if (loginBtn) {
  loginBtn.addEventListener('click', () => handleAuth('login'));
}

if (signupBtn) {
  signupBtn.addEventListener('click', () => handleAuth('signup'));
}
