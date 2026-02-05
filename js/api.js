/**
 * Módulo API para comunicación con el backend de préstamos
 */
const API = {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      ...options,
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && typeof Auth !== "undefined") {
        Auth.logout();
        Auth.checkAndRedirect();
      }
      const message = data.message || data.error || `Error ${response.status}`;
      throw new Error(Array.isArray(message) ? message.join(", ") : message);
    }
    return data;
  },

  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  },

  // Auth
  login(email, password) {
    return this.post("/auth/login", { email, password });
  },
  register(email, password, nombre) {
    return this.post("/auth/register", { email, password, nombre });
  },

  // Clientes
  getClientes(page = 1, limit = 10, search = "") {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set("search", search);
    return this.get(`/clientes?${params}`);
  },
  getCliente(id) {
    return this.get(`/clientes/${id}`);
  },
  createCliente(data) {
    return this.post("/clientes", data);
  },
  updateCliente(id, data) {
    return this.patch(`/clientes/${id}`, data);
  },
  deleteCliente(id) {
    return this.delete(`/clientes/${id}`);
  },

  // Frecuencias de pago
  getFrecuenciasPago() {
    return this.get("/frecuencia-pago");
  },

  // Préstamos
  getDashboard() {
    return this.get("/prestamos/dashboard");
  },
  getPrestamos(page = 1, limit = 10, clienteId, estado) {
    const params = new URLSearchParams({ page, limit });
    if (clienteId) params.set("cliente_id", clienteId);
    if (estado) params.set("estado", estado);
    return this.get(`/prestamos?${params}`);
  },
  getPrestamo(id) {
    return this.get(`/prestamos/${id}`);
  },
  createPrestamo(data) {
    return this.post("/prestamos", data);
  },
  updatePrestamo(id, data) {
    return this.patch(`/prestamos/${id}`, data);
  },
  saldarPrestamo(id) {
    return this.post(`/prestamos/${id}/saldar`, {});
  },
  getCuotas(prestamoId, estado) {
    const params = estado ? `?estado=${estado}` : "";
    return this.get(`/prestamos/${prestamoId}/cuotas${params}`);
  },
  getPagos(prestamoId) {
    return this.get(`/prestamos/${prestamoId}/pagos`);
  },
  registrarPago(prestamoId, data) {
    return this.post(`/prestamos/${prestamoId}/pagos`, data);
  },
};
