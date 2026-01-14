import { apiRequest, setAuthToken } from './api.js';

const initBookingForm = () => {
  const form = document.querySelector('[data-booking-form]');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('rz_token');
    if (token) {
      setAuthToken(token);
    }

    const payload = Object.fromEntries(new FormData(form));

    try {
      await apiRequest('/bookings', { method: 'POST', data: payload });
      form.reset();
      form.querySelector('[data-result]').textContent = 'Booking requested!';
    } catch (error) {
      form.querySelector('[data-result]').textContent = error.message;
    }
  });
};

initBookingForm();
