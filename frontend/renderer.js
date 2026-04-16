const apiBase = window.servicehub.apiBase;

const pageIds = {
  dashboard: 'dashboardPage',
  requests: 'requestsPage',
  employees: 'employeesPage',
  news: 'newsPage',
};

const loginPage = document.getElementById('loginPage');
const appPage = document.getElementById('appPage');
const navButtons = document.querySelectorAll('.nav-button');
const logoutButton = document.getElementById('logoutButton');
const loginButton = document.getElementById('loginButton');
const loginError = document.getElementById('loginError');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const requestFilter = document.getElementById('requestFilter');
const requestsList = document.getElementById('requestsList');
const requestTitle = document.getElementById('requestTitle');
const requestDescription = document.getElementById('requestDescription');
const createRequestButton = document.getElementById('createRequestButton');
const requestCreateError = document.getElementById('requestCreateError');
const employeeSearch = document.getElementById('employeeSearch');
const employeesList = document.getElementById('employeesList');
const newsList = document.getElementById('newsList');
const newsCreateCard = document.getElementById('newsCreateCard');
const newsTitle = document.getElementById('newsTitle');
const newsContent = document.getElementById('newsContent');
const createNewsButton = document.getElementById('createNewsButton');
const newsCreateError = document.getElementById('newsCreateError');
const dashboardGreeting = document.getElementById('dashboardGreeting');
const dashboardInfo = document.getElementById('dashboardInfo');
const totalRequests = document.getElementById('totalRequests');
const openRequests = document.getElementById('openRequests');
const progressRequests = document.getElementById('progressRequests');
const doneRequests = document.getElementById('doneRequests');

let requestsCache = [];
let usersCache = [];
let newsCache = [];

function getAccessToken() {
  return localStorage.getItem('servicehub_access_token');
}

function getRefreshToken() {
  return localStorage.getItem('servicehub_refresh_token');
}

function getUserRole() {
  return localStorage.getItem('servicehub_user_role');
}

function getUsername() {
  return localStorage.getItem('servicehub_username');
}

function setSession({ access, refresh, username, role }) {
  localStorage.setItem('servicehub_access_token', access);
  localStorage.setItem('servicehub_refresh_token', refresh);
  localStorage.setItem('servicehub_username', username);
  localStorage.setItem('servicehub_user_role', role);
}

function clearSession() {
  localStorage.removeItem('servicehub_access_token');
  localStorage.removeItem('servicehub_refresh_token');
  localStorage.removeItem('servicehub_username');
  localStorage.removeItem('servicehub_user_role');
}

function showElement(element) {
  element.classList.remove('hidden');
}

function hideElement(element) {
  element.classList.add('hidden');
}

function showPage(pageName) {
  Object.values(pageIds).forEach((pageId) => {
    const page = document.getElementById(pageId);
    if (page) {
      page.classList.add('hidden');
    }
  });

  const pageId = pageIds[pageName];
  const activePage = document.getElementById(pageId);
  if (activePage) {
    activePage.classList.remove('hidden');
  }

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.page === pageName);
  });
}

function showLogin() {
  hideElement(appPage);
  showElement(loginPage);
}

function showApp() {
  hideElement(loginPage);
  showElement(appPage);
}

async function refreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    return false;
  }

  try {
    const response = await fetch(`${apiBase}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    localStorage.setItem('servicehub_access_token', data.access);
    return true;
  } catch (error) {
    console.error('Token refresh failed', error);
    return false;
  }
}

async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${apiBase}${path}`, init);

  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${getAccessToken()}`,
      };
      const retryResponse = await fetch(`${apiBase}${path}`, {
        ...init,
        headers: retryHeaders,
      });
      if (retryResponse.ok) {
        return retryResponse;
      }
    }
    clearSession();
    showLogin();
    return response;
  }

  return response;
}

async function login() {
  loginError.textContent = '';
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    loginError.textContent = 'Username and password are required.';
    return;
  }

  try {
    const response = await fetch(`${apiBase}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      loginError.textContent = 'Login failed. Check your credentials.';
      return;
    }

    const data = await response.json();
    setSession({
      access: data.access,
      refresh: data.refresh,
      username: data.username || username,
      role: data.role || 'user',
    });
    initializeApp();
  } catch (error) {
    loginError.textContent = 'Unable to connect to backend.';
    console.error(error);
  }
}

function renderRequests(items) {
  const filter = requestFilter.value;
  const filteredRequests = filter === 'all' ? items : items.filter((item) => item.status === filter);

  if (!filteredRequests.length) {
    requestsList.innerHTML = '<div class="card">No requests available.</div>';
    return;
  }

  const rows = filteredRequests
    .map((item) => {
      return `
      <div class="table-row">
        <span>${item.title}</span>
        <span>${item.description || '—'}</span>
        <select data-id="${item.id}" class="status-select">
          <option value="open" ${item.status === 'open' ? 'selected' : ''}>Open</option>
          <option value="in_progress" ${item.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
          <option value="done" ${item.status === 'done' ? 'selected' : ''}>Done</option>
        </select>
        <span>${item.created_by}</span>
        <span>${new Date(item.created_at).toLocaleString()}</span>
      </div>
    `;
    })
    .join('');

  requestsList.innerHTML = `
    <div class="table-card">
      <div class="table-row header">
        <span>Title</span>
        <span>Description</span>
        <span>Status</span>
        <span>Author</span>
        <span>Created</span>
      </div>
      ${rows}
    </div>
  `;

  document.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', async (event) => {
      const id = event.target.dataset.id;
      const status = event.target.value;
      await updateRequestStatus(id, status);
    });
  });
}

async function loadRequests() {
  const response = await apiFetch('/api/requests/');
  if (!response.ok) {
    requestsList.innerHTML = '<div class="card">Unable to load requests.</div>';
    return;
  }
  const data = await response.json();
  requestsCache = data;
  renderRequests(data);
}

async function createRequest() {
  requestCreateError.textContent = '';
  const title = requestTitle.value.trim();
  const description = requestDescription.value.trim();

  if (!title) {
    requestCreateError.textContent = 'Title is required.';
    return;
  }

  const response = await apiFetch('/api/requests/', {
    method: 'POST',
    body: { title, description },
  });

  if (!response.ok) {
    requestCreateError.textContent = 'Unable to create request.';
    return;
  }

  requestTitle.value = '';
  requestDescription.value = '';
  await loadRequests();
  showPage('requests');
}

async function updateRequestStatus(id, status) {
  const response = await apiFetch(`/api/requests/${id}/`, {
    method: 'PATCH',
    body: { status },
  });
  if (!response.ok) {
    alert('Unable to update request status.');
  } else {
    await loadRequests();
  }
}

function renderEmployees(items) {
  const query = employeeSearch.value.trim().toLowerCase();
  const filtered = items.filter((item) => {
    return item.username.toLowerCase().includes(query) || item.email.toLowerCase().includes(query);
  });

  if (!filtered.length) {
    employeesList.innerHTML = '<div class="card">No employees found.</div>';
    return;
  }

  const rows = filtered
    .map((user) => {
      return `
      <div class="table-row">
        <span>${user.username}</span>
        <span>${user.email || '—'}</span>
        <span>${user.role}</span>
      </div>
    `;
    })
    .join('');

  employeesList.innerHTML = `
    <div class="table-card">
      <div class="table-row header">
        <span>Username</span>
        <span>Email</span>
        <span>Role</span>
      </div>
      ${rows}
    </div>
  `;
}

async function loadEmployees() {
  const response = await apiFetch('/api/users/');
  if (!response.ok) {
    employeesList.innerHTML = '<div class="card">Unable to fetch employees.</div>';
    return;
  }
  const data = await response.json();
  usersCache = data;
  renderEmployees(data);
}

function renderNews(items) {
  if (!items.length) {
    newsList.innerHTML = '<div class="card">No news items available.</div>';
    return;
  }

  const role = getUserRole();
  const rows = items
    .map((item) => {
      const controls = role === 'admin'
        ? `<button class="secondary-btn" data-action="edit" data-id="${item.id}">Edit</button>
           <button class="secondary-btn" data-action="delete" data-id="${item.id}">Delete</button>`
        : '';

      return `
      <div class="table-row">
        <span>${item.title}</span>
        <span>${item.content}</span>
        <span>${new Date(item.created_at).toLocaleDateString()}</span>
        <span>${controls}</span>
      </div>
    `;
    })
    .join('');

  newsList.innerHTML = `
    <div class="table-card">
      <div class="table-row header">
        <span>Title</span>
        <span>Content</span>
        <span>Created</span>
        <span>Actions</span>
      </div>
      ${rows}
    </div>
  `;

  document.querySelectorAll('[data-action="edit"]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const id = event.target.dataset.id;
      await editNews(id);
    });
  });

  document.querySelectorAll('[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const id = event.target.dataset.id;
      await deleteNews(id);
    });
  });
}

async function loadNews() {
  const role = getUserRole();
  if (role === 'admin') {
    showElement(newsCreateCard);
  } else {
    hideElement(newsCreateCard);
  }

  const response = await apiFetch('/api/news/');
  if (!response.ok) {
    newsList.innerHTML = '<div class="card">Unable to fetch news.</div>';
    return;
  }

  const data = await response.json();
  newsCache = data;
  renderNews(data);
}

async function createNews() {
  newsCreateError.textContent = '';
  const title = newsTitle.value.trim();
  const content = newsContent.value.trim();

  if (!title || !content) {
    newsCreateError.textContent = 'Title and content are required.';
    return;
  }

  const response = await apiFetch('/api/news/', {
    method: 'POST',
    body: { title, content },
  });

  if (!response.ok) {
    newsCreateError.textContent = 'Unable to create news item.';
    return;
  }

  newsTitle.value = '';
  newsContent.value = '';
  await loadNews();
}

async function editNews(id) {
  const item = newsCache.find((news) => news.id.toString() === id.toString());
  if (!item) {
    return;
  }

  const title = prompt('Edit title', item.title);
  if (title === null) {
    return;
  }
  const content = prompt('Edit content', item.content);
  if (content === null) {
    return;
  }

  const response = await apiFetch(`/api/news/${id}/`, {
    method: 'PUT',
    body: { title, content },
  });

  if (!response.ok) {
    alert('Unable to save news item.');
    return;
  }

  await loadNews();
}

async function deleteNews(id) {
  const confirmed = confirm('Delete this news item?');
  if (!confirmed) {
    return;
  }

  const response = await apiFetch(`/api/news/${id}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    alert('Unable to delete news item.');
    return;
  }

  await loadNews();
}

async function loadDashboard() {
  const username = getUsername();
  dashboardGreeting.textContent = `Welcome, ${username || 'User'}!`;
  dashboardInfo.textContent = 'Quick overview of requests and system status.';

  const response = await apiFetch('/api/requests/');
  if (!response.ok) {
    totalRequests.textContent = '0';
    openRequests.textContent = '0';
    progressRequests.textContent = '0';
    doneRequests.textContent = '0';
    return;
  }

  const data = await response.json();
  totalRequests.textContent = data.length;
  openRequests.textContent = data.filter((item) => item.status === 'open').length;
  progressRequests.textContent = data.filter((item) => item.status === 'in_progress').length;
  doneRequests.textContent = data.filter((item) => item.status === 'done').length;
}

function updateNavigation(page) {
  showPage(page);
  switch (page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'requests':
      loadRequests();
      break;
    case 'employees':
      loadEmployees();
      break;
    case 'news':
      loadNews();
      break;
    default:
      loadDashboard();
  }
}

function initializeApp() {
  showApp();
  updateNavigation('dashboard');
}

async function checkSession() {
  if (!getAccessToken()) {
    showLogin();
    return;
  }
  showApp();
  updateNavigation('dashboard');
}

loginButton.addEventListener('click', login);
logoutButton.addEventListener('click', () => {
  clearSession();
  showLogin();
});
requestFilter.addEventListener('change', () => renderRequests(requestsCache));
createRequestButton.addEventListener('click', createRequest);
employeeSearch.addEventListener('input', () => renderEmployees(usersCache));
createNewsButton.addEventListener('click', createNews);
navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const page = button.dataset.page;
    if (page) {
      updateNavigation(page);
    }
  });
});

checkSession();
