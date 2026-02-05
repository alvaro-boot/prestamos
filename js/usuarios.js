/**
 * Módulo de gestión de usuarios (solo ADMIN)
 */
const UsuariosModule = {
  page: 1,
  limit: 10,

  async render() {
    const content = document.getElementById("content-area");
    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
      const [usuariosRes, roles] = await Promise.all([
        API.getUsuarios(this.page, this.limit),
        API.getRoles(),
      ]);
      const { items, total, page, limit } = usuariosRes;

      content.innerHTML = `
        <div class="toolbar">
          <button class="btn btn-primary" id="btn-nuevo-usuario">+ Nuevo usuario</button>
        </div>
        <div class="table-container">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Nombre</th>
                  <th>Roles</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${
                  items.length === 0
                    ? '<tr><td colspan="6" class="empty-state"><span class="empty-state-icon">👤</span><h3>No hay usuarios</h3><p>Registra cobradores u otros usuarios</p></td></tr>'
                    : items.map((u) => this.rowUsuario(u)).join("")
                }
              </tbody>
            </table>
          </div>
          ${this.renderPagination(total, page, limit)}
        </div>
      `;

      this.roles = roles;
      this.bindEvents();
    } catch (err) {
      content.innerHTML = `<div class="error-message">${this.escapeHtml(err.message)}</div>`;
    }
  },

  rowUsuario(u) {
    const rolesStr = (u.roles || []).map((r) => r.codigo).join(", ") || "-";
    const estado = u.activo ? "Activo" : "Inactivo";
    return `
      <tr>
        <td>${u.id}</td>
        <td>${this.escapeHtml(u.email)}</td>
        <td>${this.escapeHtml(u.nombre || "-")}</td>
        <td>${this.escapeHtml(rolesStr)}</td>
        <td><span class="badge badge-${u.activo ? "activo" : "cancelado"}">${estado}</span></td>
        <td class="td-actions">
          <div class="actions-buttons">
            <button class="btn btn-secondary btn-sm btn-editar-usuario" data-id="${u.id}">Editar</button>
            <button class="btn btn-secondary btn-sm btn-roles-usuario" data-id="${u.id}">Roles</button>
          </div>
        </td>
      </tr>
    `;
  },

  renderPagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit) || 1;
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    return `
      <div class="pagination">
        <span class="pagination-info">Mostrando ${from} a ${to} de ${total}</span>
        <div class="pagination-buttons">
          <button class="btn btn-secondary btn-sm" id="btn-prev-page" ${page <= 1 ? "disabled" : ""}>Anterior</button>
          <button class="btn btn-secondary btn-sm" id="btn-next-page" ${page >= totalPages ? "disabled" : ""}>Siguiente</button>
        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById("btn-nuevo-usuario")?.addEventListener("click", () => this.openModalNuevo());
    document.getElementById("btn-prev-page")?.addEventListener("click", () => {
      this.page--;
      this.render();
    });
    document.getElementById("btn-next-page")?.addEventListener("click", () => {
      this.page++;
      this.render();
    });
    document.querySelectorAll(".btn-editar-usuario").forEach((btn) => {
      btn.addEventListener("click", () => this.openModalEditar(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll(".btn-roles-usuario").forEach((btn) => {
      btn.addEventListener("click", () => this.openModalRoles(parseInt(btn.dataset.id)));
    });
  },

  openModalNuevo() {
    const roles = this.roles || [];
    const rolesOptions = roles
      .map(
        (r) =>
          `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:8px">
            <input type="checkbox" name="rol_ids" value="${r.id}">
            ${this.escapeHtml(r.codigo)} - ${this.escapeHtml(r.descripcion || "")}
          </label>`
      )
      .join("");

    App.openModal(
      "Nuevo usuario",
      `
      <form id="form-usuario-nuevo">
        <div class="form-group">
          <label>Email *</label>
          <input type="email" name="email" required placeholder="correo@ejemplo.com">
        </div>
        <div class="form-group">
          <label>Contraseña *</label>
          <input type="password" name="password" required minlength="6" placeholder="Mínimo 6 caracteres">
        </div>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" name="nombre" placeholder="Nombre del usuario">
        </div>
        <div class="form-group">
          <label>Roles</label>
          <div style="margin-top:8px">
            ${rolesOptions || "<p style='color:var(--color-text-muted)'>No hay roles disponibles</p>"}
          </div>
          <small style="color:var(--color-text-muted)">Si no seleccionas ninguno, se asigna COBRADOR</small>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Crear usuario</button>
        </div>
      </form>
    `
    );

    document.getElementById("form-usuario-nuevo").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const rolIds = Array.from(form.querySelectorAll('input[name="rol_ids"]:checked')).map((cb) =>
        parseInt(cb.value, 10)
      );
      const data = {
        email: form.email.value.trim(),
        password: form.password.value,
        nombre: form.nombre.value.trim() || undefined,
        rol_ids: rolIds.length > 0 ? rolIds : undefined,
      };
      try {
        await API.createUsuario(data);
        App.toast("Usuario creado");
        App.closeModal();
        this.render();
      } catch (err) {
        App.showError(err.message);
      }
    });
  },

  async openModalEditar(id) {
    const u = await API.getUsuario(id);
    App.openModal(
      "Editar usuario",
      `
      <form id="form-usuario-editar">
        <div class="form-group">
          <label>Email *</label>
          <input type="email" name="email" required value="${this.escapeHtml(u.email)}">
        </div>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" name="nombre" value="${this.escapeHtml(u.nombre || "")}" placeholder="Nombre">
        </div>
        <div class="form-group">
          <label>Nueva contraseña</label>
          <input type="password" name="password" minlength="6" placeholder="Dejar vacío para no cambiar">
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" name="activo" ${u.activo ? "checked" : ""}>
            Usuario activo
          </label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `
    );

    document.getElementById("form-usuario-editar").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = {
        email: form.email.value.trim(),
        nombre: form.nombre.value.trim() || undefined,
        activo: form.activo.checked,
      };
      if (form.password.value) data.password = form.password.value;
      try {
        await API.updateUsuario(id, data);
        App.toast("Usuario actualizado");
        App.closeModal();
        this.render();
      } catch (err) {
        App.showError(err.message);
      }
    });
  },

  async openModalRoles(id) {
    const [usuario, roles] = await Promise.all([API.getUsuario(id), API.getRoles()]);
    const userRoleIds = (usuario.roles || []).map((r) => r.id);
    const rolesOptions = roles
      .map(
        (r) =>
          `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:8px">
            <input type="checkbox" name="rol_ids" value="${r.id}" ${userRoleIds.includes(r.id) ? "checked" : ""}>
            ${this.escapeHtml(r.codigo)} - ${this.escapeHtml(r.descripcion || "")}
          </label>`
      )
      .join("");

    App.openModal(
      `Asignar roles - ${this.escapeHtml(usuario.email)}`,
      `
      <form id="form-usuario-roles">
        <div class="form-group">
          <label>Roles del usuario</label>
          <div style="margin-top:8px">
            ${rolesOptions || "<p>No hay roles</p>"}
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar roles</button>
        </div>
      </form>
    `
    );

    document.getElementById("form-usuario-roles").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const rolIds = Array.from(form.querySelectorAll('input[name="rol_ids"]:checked')).map((cb) =>
        parseInt(cb.value, 10)
      );
      if (rolIds.length === 0) {
        App.showError("Debes seleccionar al menos un rol");
        return;
      }
      try {
        await API.asignarRolesUsuario(id, rolIds);
        App.toast("Roles actualizados");
        App.closeModal();
        this.render();
      } catch (err) {
        App.showError(err.message);
      }
    });
  },

  escapeHtml(str) {
    if (str == null) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },
};
