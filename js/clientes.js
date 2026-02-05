/**
 * Módulo de gestión de clientes
 */
const ClientesModule = {
  page: 1,
  limit: 10,
  search: "",

  async render() {
    const content = document.getElementById("content-area");
    content.innerHTML =
      '<div class="loading"><div class="spinner"></div></div>';

    try {
      const { items, total, page, limit } = await API.getClientes(
        this.page,
        this.limit,
        this.search
      );

      content.innerHTML = `
        <div class="toolbar">
          <input type="text" class="search-input" placeholder="Buscar por documento o nombre..." 
                 value="${this.escapeHtml(this.search)}" id="cliente-search">
          <button class="btn btn-primary" id="btn-nuevo-cliente">+ Nuevo cliente</button>
        </div>
        <div class="table-container">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Documento</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${
                  items.length === 0
                    ? '<tr><td colspan="6" class="empty-state"><span class="empty-state-icon">👥</span><h3>No hay clientes</h3><p>Agrega un cliente para comenzar</p></td></tr>'
                    : items.map((c) => this.rowCliente(c)).join("")
                }
              </tbody>
            </table>
          </div>
          ${this.renderPagination(total, page, limit)}
        </div>
      `;

      this.bindEvents();
    } catch (err) {
      content.innerHTML = `<div class="error-message">${this.escapeHtml(
        err.message
      )}</div>`;
    }
  },

  rowCliente(c) {
    return `
      <tr>
        <td>${c.id}</td>
        <td>${this.escapeHtml(c.documento)}</td>
        <td>${this.escapeHtml(c.nombre)}</td>
        <td>${this.escapeHtml(c.email || "-")}</td>
        <td>${this.escapeHtml(c.telefono || "-")}</td>
        <td class="td-actions">
          <div class="actions-buttons">
            <button class="btn btn-secondary btn-sm btn-editar-cliente" data-id="${c.id}">Editar</button>
            <button class="btn btn-danger btn-sm btn-eliminar-cliente" data-id="${c.id}">Eliminar</button>
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
          <button class="btn btn-secondary btn-sm" id="btn-prev-page" ${
            page <= 1 ? "disabled" : ""
          }>Anterior</button>
          <button class="btn btn-secondary btn-sm" id="btn-next-page" ${
            page >= totalPages ? "disabled" : ""
          }>Siguiente</button>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const searchInput = document.getElementById("cliente-search");
    if (searchInput) {
      let timeout;
      searchInput.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.search = searchInput.value.trim();
          this.page = 1;
          this.render();
        }, 400);
      });
    }

    document
      .getElementById("btn-nuevo-cliente")
      ?.addEventListener("click", () => this.openModal());
    document.getElementById("btn-prev-page")?.addEventListener("click", () => {
      this.page--;
      this.render();
    });
    document.getElementById("btn-next-page")?.addEventListener("click", () => {
      this.page++;
      this.render();
    });

    document.querySelectorAll(".btn-editar-cliente").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.openModal(parseInt(btn.dataset.id))
      );
    });
    document.querySelectorAll(".btn-eliminar-cliente").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.eliminar(parseInt(btn.dataset.id))
      );
    });
  },

  openModal(id = null) {
    const isEdit = !!id;
    App.openModal(
      isEdit ? "Editar cliente" : "Nuevo cliente",
      `
      <form id="form-cliente">
        <input type="hidden" name="id" value="${id || ""}">
        <div class="form-group">
          <label>Documento *</label>
          <input type="text" name="documento" required maxlength="20" placeholder="Ej: 12345678">
        </div>
        <div class="form-group">
          <label>Nombre *</label>
          <input type="text" name="nombre" required maxlength="150" placeholder="Nombre completo">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" maxlength="100" placeholder="correo@ejemplo.com">
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input type="text" name="telefono" maxlength="20" placeholder="3001234567">
        </div>
        <div class="form-group">
          <label>Dirección</label>
          <input type="text" name="direccion" placeholder="Dirección">
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">${
            isEdit ? "Guardar" : "Crear"
          }</button>
        </div>
      </form>
    `
    );

    if (isEdit) {
      API.getCliente(id).then((c) => {
        const form = document.getElementById("form-cliente");
        form.querySelector('[name="documento"]').value = c.documento;
        form.querySelector('[name="nombre"]').value = c.nombre;
        form.querySelector('[name="email"]').value = c.email || "";
        form.querySelector('[name="telefono"]').value = c.telefono || "";
        form.querySelector('[name="direccion"]').value = c.direccion || "";
      });
    }

    document.getElementById("form-cliente").addEventListener("submit", (e) => {
      e.preventDefault();
      this.guardar(e.target, id);
    });
  },

  async guardar(form, id) {
    const data = {
      documento: form.documento.value.trim(),
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim() || undefined,
      telefono: form.telefono.value.trim() || undefined,
      direccion: form.direccion.value.trim() || undefined,
    };
    try {
      if (id) {
        await API.updateCliente(id, data);
        App.toast("Cliente actualizado");
      } else {
        await API.createCliente(data);
        App.toast("Cliente creado");
      }
      App.closeModal();
      this.render();
    } catch (err) {
      App.showError(err.message);
    }
  },

  async eliminar(id) {
    if (!confirm("¿Eliminar este cliente? No se puede deshacer.")) return;
    try {
      await API.deleteCliente(id);
      App.toast("Cliente eliminado");
      this.render();
    } catch (err) {
      App.showError(err.message);
    }
  },

  escapeHtml(str) {
    if (str == null) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },
};
