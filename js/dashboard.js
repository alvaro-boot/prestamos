/**
 * Módulo Dashboard - Resumen de préstamos y ganancias
 */
const DashboardModule = {
  formatNumber(num) {
    return new Intl.NumberFormat("es-CO").format(num || 0);
  },

  async render() {
    const content = document.getElementById("content-area");
    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
      const data = await API.getDashboard();

      content.innerHTML = `
        <div class="dashboard-cards">
          <div class="dashboard-card dashboard-card-prestado">
            <div class="dashboard-card-icon">💰</div>
            <div class="dashboard-card-content">
              <span class="dashboard-card-label">Total prestado</span>
              <span class="dashboard-card-value">$${this.formatNumber(data.total_prestado)}</span>
              <span class="dashboard-card-hint">Capital que has entregado en préstamos</span>
            </div>
          </div>
          <div class="dashboard-card dashboard-card-cobrado">
            <div class="dashboard-card-icon">📥</div>
            <div class="dashboard-card-content">
              <span class="dashboard-card-label">Total cobrado</span>
              <span class="dashboard-card-value">$${this.formatNumber(data.total_cobrado)}</span>
              <span class="dashboard-card-hint">Lo que te han pagado (capital + interés)</span>
            </div>
          </div>
          <div class="dashboard-card dashboard-card-ganado">
            <div class="dashboard-card-icon">📈</div>
            <div class="dashboard-card-content">
              <span class="dashboard-card-label">Interés ganado</span>
              <span class="dashboard-card-value">$${this.formatNumber(data.total_ganado)}</span>
              <span class="dashboard-card-hint">Ganancia por intereses según lo que te han pagado</span>
            </div>
          </div>
        </div>
        <div class="dashboard-summary">
          <p>El <strong>interés ganado</strong> es la parte de los pagos recibidos que corresponde a intereses, no incluye lo que aún te deben.</p>
        </div>
      `;
    } catch (err) {
      content.innerHTML = `<div class="error-message">${(err && err.message) || "Error al cargar el dashboard"}</div>`;
    }
  },
};
