/**
 * Aplicación principal - Sistema de Préstamos
 */
const App = {
  init() {
    this.bindLogin();
    this.bindLogout();
    this.bindNavigation();
    this.bindModal();

    if (Auth.checkAndRedirect()) {
      const section = window.location.hash.slice(1) || "clientes";
      this.loadSection(section);
    }
  },

  bindLogin() {
    let isRegister = false;
    const toggleAuth = () => {
      isRegister = !isRegister;
      document.getElementById("auth-subtitle").textContent = isRegister
        ? "Crea tu cuenta para gestionar tus préstamos"
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
            this.loadSection("clientes");
          } else {
            await Auth.login(email, password);
            Auth.checkAndRedirect();
            this.loadSection("clientes");
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
        document
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        this.loadSection(section);
      });
    });
  },

  loadSection(section) {
    document.getElementById("page-title").textContent =
      section === "clientes" ? "Clientes" : "Préstamos";

    if (section === "clientes") {
      ClientesModule.render();
    } else if (section === "prestamos") {
      PrestamosModule.render();
    }
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
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      background: var(--color-bg-card); border: 1px solid var(--color-border);
      padding: 12px 20px; border-radius: 8px; z-index: 2000;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4); font-size: 0.9rem;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  showError(message) {
    const existing = document.querySelector(".error-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "error-toast";
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      background: rgba(244,33,46,0.2); color: var(--color-danger);
      border: 1px solid var(--color-danger); padding: 12px 20px;
      border-radius: 8px; z-index: 2000; font-size: 0.9rem;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
