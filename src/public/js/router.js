import { apiRequest, setAuthToken } from './api.js';

const handleForm = async (form) => {
  const formType = form.dataset.spaForm;
  const formData = Object.fromEntries(new FormData(form));

  if (formType === 'login') {
    const response = await apiRequest('/auth/login', { method: 'POST', data: formData });
    setAuthToken(response.tokens.accessToken);
    localStorage.setItem('rz_user', JSON.stringify(response.user));
    window.location.href = '/profile';
    return;
  }

  if (formType === 'register') {
    const response = await apiRequest('/auth/register', { method: 'POST', data: formData });
    setAuthToken(response.tokens.accessToken);
    localStorage.setItem('rz_user', JSON.stringify(response.user));
    window.location.href = '/profile';
    return;
  }

  // Default passthrough if form type unknown
  await fetch(form.action, {
    method: form.method || 'POST',
    body: new FormData(form),
  });
};

const initSpaForms = () => {
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!form.dataset.spaForm) {
      return;
    }

    event.preventDefault();
    form.querySelectorAll('[data-error]').forEach((node) => {
      node.textContent = '';
    });

    try {
      await handleForm(form);
    } catch (error) {
      const errorBox = form.querySelector('[data-error]');
      if (errorBox) {
        errorBox.textContent = error.message;
      } else {
        alert(error.message);
      }
    }
  });
};

const bootstrap = () => {
  initSpaForms();
  const token = localStorage.getItem('rz_token');
  if (token) {
    setAuthToken(token);
  }
};

bootstrap();
