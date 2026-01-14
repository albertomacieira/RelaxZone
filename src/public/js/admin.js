import { apiRequest, setAuthToken } from './api.js';

const renderAdminDashboard = async () => {
  const container = document.getElementById('admin-dashboard');
  if (!container) {
    return;
  }

  try {
    const token = localStorage.getItem('rz_token');
    if (token) {
      setAuthToken(token);
    }

    const [users, services, bookings] = await Promise.all([
      apiRequest('/users'),
      apiRequest('/services'),
      apiRequest('/bookings', { params: { scope: 'all' } }),
    ]);

    container.innerHTML = `
      <ul>
        <li>Total users: ${users.length}</li>
        <li>Total services: ${services.length}</li>
        <li>Total bookings: ${bookings.length}</li>
      </ul>
    `;
  } catch (error) {
    container.innerHTML = `<p>${error.message}</p>`;
  }
};

renderAdminDashboard();
