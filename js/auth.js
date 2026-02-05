/**
 * Módulo de autenticación
 */
const Auth = {
  isLoggedIn() {
    return !!localStorage.getItem(CONFIG.TOKEN_KEY);
  },

  getToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
  },

  getUser() {
    try {
      const user = localStorage.getItem(CONFIG.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  login(email, password) {
    return API.login(email, password).then((res) => {
      this.saveSession(res);
      return res;
    });
  },

  saveSession(res) {
    localStorage.setItem(CONFIG.TOKEN_KEY, res.access_token);
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(res.usuario));
    if (res.roles) {
      localStorage.setItem(CONFIG.ROLES_KEY, JSON.stringify(res.roles));
    }
  },

  register(email, password, nombre) {
    return API.register(email, password, nombre).then((res) => {
      this.saveSession(res);
      return res;
    });
  },

  logout() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    localStorage.removeItem(CONFIG.ROLES_KEY);
  },

  getRoles() {
    try {
      const r = localStorage.getItem(CONFIG.ROLES_KEY);
      return r ? JSON.parse(r) : [];
    } catch {
      return [];
    }
  },

  hasRole(role) {
    return this.getRoles().includes(role);
  },

  isAdmin() {
    return this.hasRole("ADMIN");
  },

  canEdit() {
    return this.hasRole("ADMIN") || this.hasRole("COBRADOR");
  },

  checkAndRedirect() {
    if (!this.isLoggedIn()) {
      document.getElementById("login-screen").classList.add("active");
      document.getElementById("main-screen").classList.remove("active");
      return false;
    }
    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("main-screen").classList.add("active");
    const user = this.getUser();
    document.getElementById("user-email").textContent =
      user?.nombre || user?.email || "";
    return true;
  },
};
