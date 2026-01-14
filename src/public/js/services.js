import { apiRequest } from './api.js';

const renderServices = async () => {
  const container = document.getElementById('services-grid');
  if (!container) {
    return;
  }

  try {
    const services = await apiRequest('/services');
    if (!services.length) {
      container.innerHTML = '<p>No services available.</p>';
      return;
    }

    container.innerHTML = services
      .map(
        (service) => `
        <article class="service-card">
          <h2>${service.name}</h2>
          <p>${service.description || 'No description'}</p>
          <p><strong>${service.duration} min</strong> · ${service.price}€</p>
        </article>
      `
      )
      .join('');
  } catch (error) {
    container.innerHTML = `<p>${error.message}</p>`;
  }
};

renderServices();
