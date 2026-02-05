/**
 * Aplicación principal - Sistema de Préstamos
 */
const App = {
  init() {
    this.bindLogin();
    this.bindLogout();
    this.bindNavigation();
    this.bindModal();
    this.bindSidebarToggle();

    if (Auth.checkAndRedirect()) {
      this.updateNavByRole();
      const section = window.location.hash.slice(1) || "dashboard";
      this.loadSection(section);
    }
  },

  bindLogin() {
    let isRegister = false;
    const toggleAuth = () => {
      isRegister = !isRegister;
      document.getElementById("auth-subtitle").textContent = isRegister
        ? "Crea tu cuenta como administrador (tendrás tus propios clientes y cobradores)"
        : "Ingresa tus credenciales para continuar";
      document.getElementById("auth-submit").textContent = isRegister
        ? "Registrarse"
        : "Iniciar sesión";
      const nombreGroup = document.getElementById("nombre-group");
      const nombreInput = document.getElementById("nombre");
      nombreGroup.style.display = isRegister ? "block" : "none";
      nombreInput.required = isRegister;
      document.getElementById("toggle-auth").innerHTML = isRegister
        ? "¿Ya tienes cuenta? <strong>Inicia sesión</strong>"
        : "¿No tienes cuenta? <strong>Regístrate aquí</strong>";
      document.getElementById("login-error").classList.add("hidden");
    };
    document.getElementById("toggle-auth")?.addEventListener("click", (e) => {
      e.preventDefault();
      toggleAuth();
    });

    document
      .getElementById("login-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value.trim();
        const password = form.password.value;
        const nombre = form.nombre?.value?.trim();
        const errorEl = document.getElementById("login-error");
        const submitBtn = form.querySelector('button[type="submit"]');

        errorEl.classList.add("hidden");
        errorEl.textContent = "";
        submitBtn.disabled = true;

        try {
          if (isRegister) {
            await Auth.register(email, password, nombre);
            Auth.checkAndRedirect();
            this.updateNavByRole();
            this.loadSection("dashboard");
          } else {
            await Auth.login(email, password);
            Auth.checkAndRedirect();
            this.updateNavByRole();
            this.loadSection("dashboard");
          }
        } catch (err) {
          errorEl.textContent = err.message || "Error";
          errorEl.classList.remove("hidden");
        } finally {
          submitBtn.disabled = false;
        }
      });
  },

  bindLogout() {
    document.getElementById("btn-logout")?.addEventListener("click", () => {
      Auth.logout();
      Auth.checkAndRedirect();
    });
  },

  bindNavigation() {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        window.location.hash = section;
        this.loadSection(section);
        this.closeSidebarMobile();
      });
    });
    window.addEventListener("hashchange", () => {
      const section = window.location.hash.slice(1) || "dashboard";
      this.loadSection(section);
    });
  },

  bindSidebarToggle() {
    const toggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const closeSidebar = () => {
      document.getElementById("sidebar")?.classList.remove("sidebar-open");
      document.getElementById("sidebar-backdrop")?.classList.remove("active");
      document.body.style.overflow = "";
    };
    toggle?.addEventListener("click", () => {
      sidebar?.classList.toggle("sidebar-open");
      backdrop?.classList.toggle("active");
      document.body.style.overflow = document.getElementById("sidebar")?.classList.contains("sidebar-open") ? "hidden" : "";
    });
    backdrop?.addEventListener("click", closeSidebar);
    this.closeSidebarMobile = closeSidebar;
  },

  loadSection(section) {
    const titles = { dashboard: "Dashboard", clientes: "Clientes", prestamos: "Préstamos", usuarios: "Usuarios" };
    document.getElementById("page-title").textContent = titles[section] || "Dashboard";

    document.querySelectorAll(".nav-link").forEach((l) => {
      l.classList.toggle("active", l.dataset.section === section);
    });

    if (section === "dashboard") {
      DashboardModule.render();
    } else if (section === "clientes") {
      ClientesModule.render();
    } else if (section === "prestamos") {
      PrestamosModule.render();
    } else if (section === "usuarios") {
      UsuariosModule.render();
    }
  },

  updateNavByRole() {
    const isAdmin = Auth.isAdmin();
    document.querySelectorAll(".nav-admin-only").forEach((el) => {
      el.style.display = isAdmin ? "" : "none";
    });
  },

  bindModal() {
    document
      .getElementById("modal-close")
      ?.addEventListener("click", () => this.closeModal());
    document.getElementById("modal-overlay")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeModal();
    });
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-modal-close]")) this.closeModal();
    });
  },

  openModal(title, body) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML = body;
    document.getElementById("modal-overlay").classList.remove("hidden");
  },

  closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
  },

  toast(message) {
    const existing = document.querySelector(".toast-msg");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast toast-msg";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  showError(message) {
    const existing = document.querySelector(".error-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast error-toast toast-msg";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
