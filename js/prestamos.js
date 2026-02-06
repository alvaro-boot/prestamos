/**
 * Módulo de gestión de préstamos, cuotas y pagos
 */
const PrestamosModule = {
  page: 1,
  limit: 10,
  clienteId: "",
  estado: "",

  async render() {
    const content = document.getElementById("content-area");
    content.innerHTML =
      '<div class="loading"><div class="spinner"></div></div>';

    try {
      let clientes = [];
      try {
        const res = await API.getClientes(1, 500);
        clientes = res.items;
      } catch (_) {}

      const { items, total, page, limit } = await API.getPrestamos(
        this.page,
        this.limit,
        this.clienteId || undefined,
        this.estado || undefined
      );

      const canEdit = Auth.canEdit();
      content.innerHTML = `
        <div class="toolbar">
          <input type="text" class="search-input" placeholder="Buscar..." id="prestamo-search" style="display:none">
          <select class="filter-select" id="filter-cliente">
            <option value="">Todos los clientes</option>
            ${clientes
              .map(
                (c) =>
                  `<option value="${c.id}" ${
                    this.clienteId == c.id ? "selected" : ""
                  }>${this.escapeHtml(c.nombre)}</option>`
              )
              .join("")}
          </select>
          <select class="filter-select" id="filter-estado">
            <option value="">Todos los estados</option>
            <option value="ACTIVO" ${
              this.estado === "ACTIVO" ? "selected" : ""
            }>Activo</option>
            <option value="PAGADO" ${
              this.estado === "PAGADO" ? "selected" : ""
            }>Pagado</option>
            <option value="CANCELADO" ${
              this.estado === "CANCELADO" ? "selected" : ""
            }>Cancelado</option>
            <option value="REFINANCIADO" ${
              this.estado === "REFINANCIADO" ? "selected" : ""
            }>Refinanciado</option>
          </select>
          ${canEdit ? '<button class="btn btn-primary" id="btn-nuevo-prestamo">+ Nuevo préstamo</button>' : ""}
        </div>
        <div class="prestamos-list">
          <div class="prestamos-table-wrap">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    items.length === 0
                      ? '<tr><td colspan="5" class="empty-state"><span class="empty-state-icon">📋</span><h3>No hay préstamos</h3><p>Crea un préstamo para comenzar</p></td></tr>'
                      : items.map((p) => this.rowPrestamo(p)).join("")
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div class="prestamos-cards-wrap">
            ${
              items.length === 0
                ? '<div class="empty-state"><span class="empty-state-icon">📋</span><h3>No hay préstamos</h3><p>Crea un préstamo para comenzar</p></div>'
                : items.map((p) => this.cardPrestamo(p)).join("")
            }
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

  rowPrestamo(p) {
    const cliente = p.cliente ? p.cliente.nombre : "-";
    const fecha = p.fechaCreacion
      ? new Date(p.fechaCreacion).toLocaleDateString("es")
      : "-";
    const badgeClass = `badge-${(p.estado || "").toLowerCase()}`;
    const canEdit = Auth.canEdit();
    const acciones = canEdit
      ? `<div class="actions-buttons">
          <button class="btn btn-secondary btn-sm btn-ver-prestamo" data-id="${p.id}">Ver</button>
          ${
            p.estado === "ACTIVO" && Auth.canEdit()
              ? `<button class="btn btn-primary btn-sm btn-registrar-pago" data-id="${p.id}">Reg. pago</button>
            <button class="btn btn-secondary btn-sm btn-modificar-prestamo" data-id="${p.id}">Modificar</button>
            <button class="btn btn-success btn-sm btn-saldar-prestamo" data-id="${p.id}" title="Marcar como pagado">Marcar pagado</button>`
              : ""
          }
        </div>`
      : `<div class="actions-buttons">
          <button class="btn btn-secondary btn-sm btn-ver-prestamo" data-id="${p.id}">Ver</button>
        </div>`;
    return `
      <tr>
        <td>${p.id}</td>
        <td>${this.escapeHtml(cliente)}</td>
        <td><span class="badge ${badgeClass}">${this.escapeHtml(p.estado)}</span></td>
        <td>${fecha}</td>
        <td class="td-actions">${acciones}</td>
      </tr>
    `;
  },

  cardPrestamo(p) {
    const cliente = p.cliente ? p.cliente.nombre : "-";
    const fecha = p.fechaCreacion
      ? new Date(p.fechaCreacion).toLocaleDateString("es")
      : "-";
    const badgeClass = `badge-${(p.estado || "").toLowerCase()}`;
    const canEdit = Auth.canEdit();
    const acciones = canEdit
      ? `<button class="btn btn-secondary btn-sm btn-ver-prestamo" data-id="${p.id}">Ver</button>
          ${
            p.estado === "ACTIVO"
              ? `<button class="btn btn-primary btn-sm btn-registrar-pago" data-id="${p.id}">Reg. pago</button>
          <button class="btn btn-secondary btn-sm btn-modificar-prestamo" data-id="${p.id}">Modificar</button>
          <button class="btn btn-success btn-sm btn-saldar-prestamo" data-id="${p.id}">Marcar pagado</button>`
              : ""
          }`
      : `<button class="btn btn-secondary btn-sm btn-ver-prestamo" data-id="${p.id}">Ver</button>`;
    return `
      <div class="prestamo-list-card" data-id="${p.id}">
        <div class="prestamo-list-card-header">
          <span class="prestamo-list-card-id">#${p.id}</span>
          <span class="badge ${badgeClass}">${this.escapeHtml(p.estado)}</span>
        </div>
        <div class="prestamo-list-card-body">
          <div class="prestamo-list-card-row">
            <span class="prestamo-list-card-label">Cliente</span>
            <span>${this.escapeHtml(cliente)}</span>
          </div>
          <div class="prestamo-list-card-row">
            <span class="prestamo-list-card-label">Fecha</span>
            <span>${fecha}</span>
          </div>
        </div>
        <div class="prestamo-list-card-actions">
          ${acciones}
        </div>
      </div>
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
    document
      .getElementById("filter-cliente")
      ?.addEventListener("change", (e) => {
        this.clienteId = e.target.value || "";
        this.page = 1;
        this.render();
      });
    document
      .getElementById("filter-estado")
      ?.addEventListener("change", (e) => {
        this.estado = e.target.value || "";
        this.page = 1;
        this.render();
      });
    document
      .getElementById("btn-nuevo-prestamo")
      ?.addEventListener("click", () => this.openModalNuevo());
    document.getElementById("btn-prev-page")?.addEventListener("click", () => {
      this.page--;
      this.render();
    });
    document.getElementById("btn-next-page")?.addEventListener("click", () => {
      this.page++;
      this.render();
    });
    document.querySelectorAll(".btn-ver-prestamo").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.verDetalle(parseInt(btn.dataset.id))
      );
    });
    document.querySelectorAll(".btn-registrar-pago").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.openModalPago(parseInt(btn.dataset.id))
      );
    });
    document.querySelectorAll(".btn-modificar-prestamo").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.openModalModificar(parseInt(btn.dataset.id))
      );
    });
    document.querySelectorAll(".btn-saldar-prestamo").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.saldarPrestamo(parseInt(btn.dataset.id))
      );
    });
  },

  async openModalNuevo() {
    let clientes = [];
    let frecuencias = [];
    try {
      [clientes, frecuencias] = await Promise.all([
        API.getClientes(1, 500).then((r) => r.items),
        API.getFrecuenciasPago(),
      ]);
    } catch (err) {
      App.showError(err.message);
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);

    App.openModal(
      "Nuevo préstamo",
      `
      <form id="form-prestamo">
        <div class="form-group">
          <label>Cliente *</label>
          <select name="cliente_id" required>
            <option value="">Seleccionar cliente</option>
            ${clientes
              .map(
                (c) =>
                  `<option value="${c.id}">${this.escapeHtml(c.nombre)} (${
                    c.documento
                  })</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Monto *</label>
            <input type="number" name="monto" required min="1" step="0.01" placeholder="1000000">
          </div>
          <div class="form-group">
            <label>Interés mensual (%) *</label>
            <input type="number" name="interes_porcentaje" required min="0" max="100" step="0.01" placeholder="10" title="Ej: 10 = 10% por mes (100.000 → 10.000 de interés/mes)">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Plazo (meses) *</label>
            <input type="number" name="plazo_meses" required min="1" placeholder="12">
          </div>
          <div class="form-group">
            <label>Frecuencia de pago *</label>
            <select name="frecuencia_pago_id" required>
              <option value="">Seleccionar</option>
              ${frecuencias
                .map(
                  (f) =>
                    `<option value="${f.id}" data-cuotas="${
                      f.cuotasPorMes ?? (f.codigo === "QUINCENAL" ? 2 : 1)
                    }">${this.escapeHtml(f.descripcion || f.codigo)}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>
        <div class="form-group" id="cuota-options">
          <label>Valor de la cuota</label>
          <div style="display:flex;gap:16px;align-items:center;margin-bottom:8px">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="radio" name="cuota_modo" value="auto" checked> Automático (calculado)
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="radio" name="cuota_modo" value="manual"> Manual (redondear)
            </label>
          </div>
          <div id="cuota-auto-preview" style="color:var(--color-text-muted);font-size:0.9rem">Cuota calculada: $0</div>
          <div id="cuota-manual-wrap" style="display:none;margin-top:8px">
            <div class="form-group" style="margin-bottom:8px">
              <label style="font-size:0.85rem;color:var(--color-text-muted)">Monto mensual (a capital)</label>
              <input type="text" id="input-capital-cuota" readonly style="background:var(--color-bg-card);cursor:not-allowed;opacity:0.9">
            </div>
            <div class="form-group" style="margin-bottom:8px">
              <label style="font-size:0.85rem;color:var(--color-text-muted)">Interés (redondear)</label>
              <input type="number" name="interes_cuota" min="0" step="1" placeholder="Ej: 8000" id="input-interes-cuota">
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label style="font-size:0.85rem;color:var(--color-text-muted)">Cuota total</label>
              <input type="number" name="cuota_total" min="0" step="1" placeholder="Ej: 58000" id="input-cuota-total" title="Suma de capital + interés. Si lo redondeas, la diferencia se suma al interés.">
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Fecha de inicio *</label>
          <input type="date" name="fecha_inicio" required value="${hoy}">
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Crear préstamo</button>
        </div>
      </form>
    `
    );

    const form = document.getElementById("form-prestamo");
    const updateCuotaPreview = () => {
      const monto = parseFloat(form.monto.value) || 0;
      const interes = parseFloat(form.interes_porcentaje.value) || 0;
      const plazo = parseInt(form.plazo_meses.value) || 1;
      const freqOpt = form.frecuencia_pago_id.selectedOptions[0];
      const cuotasPorMes = freqOpt
        ? parseInt(freqOpt.dataset.cuotas || "1")
        : 1;
      const numCuotas = plazo * cuotasPorMes;
      const capitalPorCuota = numCuotas > 0 ? monto / numCuotas : 0;
      const totalInteres = monto * (interes / 100) * plazo;
      const interesPorCuota = numCuotas > 0 ? totalInteres / numCuotas : 0;
      const cuotaCalc = capitalPorCuota + interesPorCuota;
      document.getElementById("cuota-auto-preview").textContent =
        "Cuota calculada: $" + this.formatNumber(cuotaCalc);
      if (form.cuota_modo.value === "manual") {
        const capitalInput = document.getElementById("input-capital-cuota");
        const interesInput = document.getElementById("input-interes-cuota");
        const cuotaTotalInput = document.getElementById("input-cuota-total");
        const capitalRedondeado = Math.round(capitalPorCuota * 100) / 100;
        capitalInput.value = "$" + this.formatNumber(capitalRedondeado);
        capitalInput.dataset.valor = capitalRedondeado;
        const interesRedondeado = Math.round(interesPorCuota * 100) / 100;
        if (!interesInput.value || interesInput.dataset.auto === "1") {
          interesInput.value = interesRedondeado || "";
          interesInput.dataset.auto = "1";
        }
        interesInput.placeholder = "Ej: " + Math.round(interesPorCuota).toLocaleString();
        const interesActual = parseFloat(interesInput.value) || 0;
        const cuotaTotal = Math.round((capitalRedondeado + interesActual) * 100) / 100;
        cuotaTotalInput.value = cuotaTotal || "";
        cuotaTotalInput.placeholder = "Ej: " + Math.round(capitalRedondeado + interesRedondeado).toLocaleString();
      }
    };

    ["monto", "interes_porcentaje", "plazo_meses"].forEach((name) => {
      form
        .querySelector(`[name="${name}"]`)
        ?.addEventListener("input", updateCuotaPreview);
    });
    form.frecuencia_pago_id?.addEventListener("change", updateCuotaPreview);
    document.getElementById("input-interes-cuota")?.addEventListener("input", () => {
      const interesInput = document.getElementById("input-interes-cuota");
      interesInput.dataset.auto = "0";
      const capital = parseFloat(document.getElementById("input-capital-cuota")?.dataset.valor) || 0;
      const interes = parseFloat(interesInput.value) || 0;
      document.getElementById("input-cuota-total").value = Math.round((capital + interes) * 100) / 100 || "";
    });
    document.getElementById("input-cuota-total")?.addEventListener("input", () => {
      const cuotaTotalInput = document.getElementById("input-cuota-total");
      const capital = parseFloat(document.getElementById("input-capital-cuota")?.dataset.valor) || 0;
      const cuotaTotal = parseFloat(cuotaTotalInput.value) || 0;
      if (cuotaTotal >= capital) {
        const nuevoInteres = Math.round((cuotaTotal - capital) * 100) / 100;
        const interesInput = document.getElementById("input-interes-cuota");
        interesInput.value = nuevoInteres;
        interesInput.dataset.auto = "0";
      }
    });

    form.querySelectorAll('input[name="cuota_modo"]').forEach((r) => {
      r.addEventListener("change", () => {
        const isManual = form.cuota_modo.value === "manual";
        document.getElementById("cuota-auto-preview").style.display = isManual
          ? "none"
          : "block";
        document.getElementById("cuota-manual-wrap").style.display = isManual
          ? "block"
          : "none";
        if (isManual) {
          document.getElementById("input-interes-cuota").dataset.auto = "1";
          document.getElementById("input-interes-cuota").value = "";
          document.getElementById("input-cuota-total").value = "";
          updateCuotaPreview();
        }
      });
    });
    updateCuotaPreview();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        cliente_id: parseInt(form.cliente_id.value),
        monto: parseFloat(form.monto.value),
        interes_porcentaje: parseFloat(form.interes_porcentaje.value),
        plazo_meses: parseInt(form.plazo_meses.value),
        frecuencia_pago_id: parseInt(form.frecuencia_pago_id.value),
        fecha_inicio: form.fecha_inicio.value,
      };
      if (form.cuota_modo.value === "manual") {
        const monto = parseFloat(form.monto.value) || 0;
        const interes = parseFloat(form.interes_porcentaje.value) || 0;
        const plazo = parseInt(form.plazo_meses.value) || 1;
        const freqOpt = form.frecuencia_pago_id.selectedOptions[0];
        const cuotasPorMes = freqOpt
          ? parseInt(freqOpt.dataset.cuotas || "1")
          : 1;
        const numCuotas = plazo * cuotasPorMes;
        const capitalPorCuota = numCuotas > 0 ? monto / numCuotas : 0;
        const totalInteres = monto * (interes / 100) * plazo;
        const interesCalculado = numCuotas > 0 ? totalInteres / numCuotas : 0;
        const cuotaTotalInput = parseFloat(form.cuota_total?.value);
        const interesInput = parseFloat(form.interes_cuota?.value);
        const interesFinal = !isNaN(interesInput) && interesInput >= 0
          ? interesInput
          : Math.round(interesCalculado * 100) / 100;
        data.monto_cuota = !isNaN(cuotaTotalInput) && cuotaTotalInput > 0
          ? Math.round(cuotaTotalInput * 100) / 100
          : Math.round((capitalPorCuota + interesFinal) * 100) / 100;
      }
      try {
        await API.createPrestamo(data);
        App.toast("Préstamo creado");
        App.closeModal();
        this.render();
      } catch (err) {
        App.showError(err.message);
      }
    });
  },

  async verDetalle(id) {
    const content = document.getElementById("content-area");
    content.innerHTML =
      '<div class="loading"><div class="spinner"></div></div>';

    try {
      const [prestamo, cuotas, pagos] = await Promise.all([
        API.getPrestamo(id),
        API.getCuotas(id),
        API.getPagos(id),
      ]);

      const version = prestamo.versiones?.[0];
      const montoTotal = version?.montoTotal || 0;
      const monto = version?.monto || 0;

      content.innerHTML = `
        <div class="toolbar">
          <button class="btn btn-secondary" id="btn-volver-prestamos">← Volver a préstamos</button>
          ${
            prestamo.estado === "ACTIVO" && Auth.canEdit()
              ? `<button class="btn btn-primary" id="btn-registrar-pago-detalle">Registrar pago</button>
          <button class="btn btn-secondary" id="btn-modificar-detalle">Modificar plazo/cuotas</button>
          <button class="btn btn-success" id="btn-saldar-detalle">Marcar como pagado</button>`
              : ""
          }
        </div>
        <div class="prestamo-card">
          <div class="prestamo-card-header">
            <span class="prestamo-card-title">Préstamo #${prestamo.id}</span>
            <span class="badge badge-${(
              prestamo.estado || ""
            ).toLowerCase()}">${prestamo.estado}</span>
          </div>
          <div class="prestamo-card-meta">
            <span>Cliente: ${this.escapeHtml(
              prestamo.cliente?.nombre || "-"
            )}</span>
            <span>Monto: $${this.formatNumber(monto)}</span>
            <span>Total a pagar: $${this.formatNumber(montoTotal)}</span>
          </div>
        </div>
        <h3 style="margin: 24px 0 12px; display: flex; align-items: center; gap: 12px;">
          Cuotas
          <button type="button" class="btn btn-secondary btn-sm" id="btn-ver-desglose" title="Ver desglose capital e interés">
            📊 Ver desglose capital/interés
          </button>
        </h3>
        <div class="table-container">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Monto</th>
                  <th>Saldo</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${(cuotas || [])
                  .filter((c) => c.estado !== "REFINANCIADA")
                  .map(
                    (c) => `
                  <tr>
                    <td>${c.numeroCuota}</td>
                    <td>$${this.formatNumber(c.montoCuota)}</td>
                    <td>$${this.formatNumber(c.saldoCuota)}</td>
                    <td>${new Date(c.fechaVencimiento).toLocaleDateString(
                      "es"
                    )}</td>
                    <td><span class="badge badge-${(
                      c.estado || ""
                    ).toLowerCase()}">${c.estado}</span></td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
        <h3 style="margin: 24px 0 12px;">Historial de pagos</h3>
        <div class="table-container">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Referencia</th>
                </tr>
              </thead>
              <tbody>
                ${
                  (pagos || []).length === 0
                    ? '<tr><td colspan="4" class="empty-state">Sin pagos registrados</td></tr>'
                    : (pagos || [])
                        .map(
                          (p) => `
                    <tr>
                      <td>${new Date(p.fechaPago).toLocaleString("es")}</td>
                      <td>$${this.formatNumber(p.montoPagado)}</td>
                      <td>${this.escapeHtml(p.metodoPago || "-")}</td>
                      <td>${this.escapeHtml(p.referencia || "-")}</td>
                    </tr>
                  `
                        )
                        .join("")
                }
              </tbody>
            </table>
          </div>
        </div>
      `;

      document
        .getElementById("btn-volver-prestamos")
        ?.addEventListener("click", () => this.render());
      document
        .getElementById("btn-registrar-pago-detalle")
        ?.addEventListener("click", () => this.openModalPago(id));
      document
        .getElementById("btn-modificar-detalle")
        ?.addEventListener("click", () => this.openModalModificar(id));
      document
        .getElementById("btn-saldar-detalle")
        ?.addEventListener("click", () => this.saldarPrestamo(id));
      document
        .getElementById("btn-ver-desglose")
        ?.addEventListener("click", () =>
          this.mostrarDesgloseCuotas(prestamo, cuotas)
        );
    } catch (err) {
      content.innerHTML = `<div class="error-message">${this.escapeHtml(
        err.message
      )}</div>`;
    }
  },

  /**
   * Calcula el desglose capital/interés por cuota (interés simple).
   * El capital SIEMPRE es el monto original del préstamo (no cambia al refinanciar).
   * El interés es FIJO por cuota: interés_mensual / cuotasPorMes.
   */
  mostrarDesgloseCuotas(prestamo, cuotas) {
    const cuotasFiltradas = (cuotas || []).filter(
      (c) => c.estado !== "REFINANCIADA"
    );
    if (cuotasFiltradas.length === 0) {
      App.openModal(
        "Desglose capital/interés",
        "<p>No hay cuotas para mostrar.</p>"
      );
      return;
    }

    const versiones = (prestamo.versiones || []).sort(
      (a, b) => (a.id || 0) - (b.id || 0)
    );
    const versionMap = {};
    versiones.forEach((v) => (versionMap[v.id] = v));

    const primeraVersion = versiones[0];
    const capitalOriginal = Number(primeraVersion?.monto || 0);
    const interesPorcentajeOriginal =
      Number(primeraVersion?.interesPorcentaje) || 0;

    const cuotasPorVersion = {};
    cuotasFiltradas.forEach((c) => {
      const vid = c.prestamoVersionId;
      if (!cuotasPorVersion[vid]) cuotasPorVersion[vid] = [];
      cuotasPorVersion[vid].push(c);
    });

    let capitalYaAsignado = 0;
    const capitalPorCuota = {};
    const interesPorCuota = {};

    versiones.forEach((v) => {
      const cts = cuotasPorVersion[v.id] || [];
      if (cts.length === 0) return;

      const cuotasPorMes = v.frecuenciaPago?.cuotasPorMes ?? 1;
      const plazoMeses = v.plazoMeses || 1;
      const totalCuotasPlan = plazoMeses * cuotasPorMes;
      const numCuotas = cts.length;

      if (v.id === primeraVersion?.id) {
        const capitalPorC =
          totalCuotasPlan > 0 ? capitalOriginal / totalCuotasPlan : 0;
        const interesMensual =
          capitalOriginal * (interesPorcentajeOriginal / 100);
        const interesPorC =
          cuotasPorMes > 0 ? interesMensual / cuotasPorMes : 0;

        cts.forEach((c) => {
          capitalPorCuota[c.id] = Math.round(capitalPorC * 100) / 100;
          interesPorCuota[c.id] = Math.round(interesPorC * 100) / 100;
        });
        capitalYaAsignado += capitalPorC * numCuotas;
      } else {
        const capitalRestante =
          Number(v.monto) > 0
            ? Number(v.monto)
            : capitalOriginal - capitalYaAsignado;
        const capitalPorC = numCuotas > 0 ? capitalRestante / numCuotas : 0;
        const interesMensual =
          capitalOriginal * (interesPorcentajeOriginal / 100);
        const interesPorC =
          cuotasPorMes > 0 ? interesMensual / cuotasPorMes : 0;

        cts.forEach((c) => {
          capitalPorCuota[c.id] = Math.round(capitalPorC * 100) / 100;
          interesPorCuota[c.id] = Math.round(interesPorC * 100) / 100;
        });
        capitalYaAsignado += capitalPorC * numCuotas;
      }
    });

    const rows = cuotasFiltradas.map((c) => {
      const capital = capitalPorCuota[c.id] ?? Number(c.montoCuota);
      const interes = interesPorCuota[c.id] ?? 0;

      return `
        <tr>
          <td>${c.numeroCuota}</td>
          <td>$${this.formatNumber(capital)}</td>
          <td>$${this.formatNumber(interes)}</td>
          <td>$${this.formatNumber(c.montoCuota)}</td>
          <td>$${this.formatNumber(c.saldoCuota)}</td>
          <td>${new Date(c.fechaVencimiento).toLocaleDateString("es")}</td>
          <td><span class="badge badge-${(c.estado || "").toLowerCase()}">${
        c.estado
      }</span></td>
        </tr>
      `;
    });

    const totalCapital = cuotasFiltradas.reduce(
      (sum, c) => sum + (capitalPorCuota[c.id] ?? 0),
      0
    );
    const totalInteres = cuotasFiltradas.reduce(
      (sum, c) => sum + (interesPorCuota[c.id] ?? 0),
      0
    );

    App.openModal(
      "Desglose capital e interés por cuota",
      `
      <p style="margin-bottom:16px;color:var(--color-text-muted);font-size:0.9rem">
        ${
          capitalOriginal > 0
            ? `El capital total es el monto original del préstamo ($${this.formatNumber(
                capitalOriginal
              )}). Lo que ya pagaste en capital reduce el saldo pendiente.`
            : "Desglose de capital e interés por cuota."
        }
      </p>
      <div class="table-container">
        <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Capital</th>
              <th>Interés</th>
              <th>Total cuota</th>
              <th>Saldo</th>
              <th>Vencimiento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${rows.join("")}
          </tbody>
          <tfoot>
            <tr style="font-weight:600;border-top:1px solid var(--color-border)">
              <td>Total</td>
              <td>$${this.formatNumber(totalCapital)}</td>
              <td>$${this.formatNumber(totalInteres)}</td>
              <td>$${this.formatNumber(
                cuotasFiltradas.reduce((s, c) => s + Number(c.montoCuota), 0)
              )}</td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
    `
    );
  },

  async saldarPrestamo(id) {
    if (
      !confirm(
        "¿Marcar este préstamo como pagado? Se saldarán todas las cuotas pendientes y el estado cambiará a PAGADO."
      )
    )
      return;
    try {
      await API.saldarPrestamo(id);
      App.toast("Préstamo marcado como pagado");
      if (document.getElementById("btn-volver-prestamos")) {
        this.verDetalle(id);
      } else {
        this.render();
      }
    } catch (err) {
      App.showError(err.message);
    }
  },

  async openModalModificar(prestamoId) {
    let prestamo, frecuencias, cuotas;
    try {
      [prestamo, frecuencias, cuotas] = await Promise.all([
        API.getPrestamo(prestamoId),
        API.getFrecuenciasPago(),
        API.getCuotas(prestamoId),
      ]);
    } catch (err) {
      App.showError(err.message);
      return;
    }
    const version = prestamo.versiones?.sort(
      (a, b) => (b.id || 0) - (a.id || 0)
    )[0];
    const plazoActual = version?.plazoMeses || 12;
    const freqActual = version?.frecuenciaPagoId || version?.frecuenciaPago?.id;

    const cuotasConSaldo = (cuotas || []).filter(
      (c) => c.estado !== "REFINANCIADA" && Number(c.saldoCuota) > 0
    );
    const saldoPendiente = cuotasConSaldo.reduce(
      (sum, c) => sum + Number(c.saldoCuota),
      0
    );
    const totalCuotas = (cuotas || []).filter(
      (c) => c.estado !== "REFINANCIADA"
    );
    const totalPagado = totalCuotas.reduce(
      (sum, c) => sum + (Number(c.montoCuota) - Number(c.saldoCuota)),
      0
    );

    App.openModal(
      "Modificar plazo y cuotas",
      `
      <p style="margin-bottom:16px;color:var(--color-text-muted);font-size:0.9rem">
        Cambia el plazo (meses) y/o la frecuencia de pago.
      </p>
      ${
        cuotasConSaldo.length > 0
          ? `
      <div class="saldo-info" style="background:var(--color-bg-hover);padding:12px 16px;border-radius:8px;margin-bottom:16px;border:1px solid var(--color-border)">
        <strong>Saldo pendiente:</strong> $${this.formatNumber(saldoPendiente)}
        ${
          totalPagado > 0
            ? ` <span style="color:var(--color-text-muted)">(ya pagaste $${this.formatNumber(
                totalPagado
              )})</span>`
            : ""
        }
        <br><small style="color:var(--color-text-muted)">El nuevo plazo e interés se calcularán solo sobre lo que falta por pagar.</small>
      </div>
      `
          : `
      <p style="margin-bottom:16px;color:var(--color-text-muted);font-size:0.9rem">
        Sin pagos registrados: se modificarán las cuotas del monto original.
      </p>
      `
      }
      <form id="form-modificar-prestamo">
        <div class="form-row">
          <div class="form-group">
            <label>Plazo (meses) *</label>
            <input type="number" name="plazo_meses" required min="1" value="${plazoActual}" placeholder="12">
          </div>
          <div class="form-group">
            <label>Frecuencia de pago *</label>
            <select name="frecuencia_pago_id" required>
              ${frecuencias
                .map(
                  (f) =>
                    `<option value="${f.id}" ${
                      freqActual == f.id ? "selected" : ""
                    }>${this.escapeHtml(f.descripcion || f.codigo)}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary">Aplicar cambios</button>
        </div>
      </form>
    `
    );

    document
      .getElementById("form-modificar-prestamo")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = {
          plazo_meses: parseInt(form.plazo_meses.value),
          frecuencia_pago_id: parseInt(form.frecuencia_pago_id.value),
        };
        try {
          await API.updatePrestamo(prestamoId, data);
          App.toast("Préstamo modificado");
          App.closeModal();
          this.verDetalle(prestamoId);
        } catch (err) {
          App.showError(err.message);
        }
      });
  },

  async openModalPago(prestamoId) {
    let cuotas = [];
    try {
      cuotas = await API.getCuotas(prestamoId);
    } catch (err) {
      App.showError(err.message);
      return;
    }
    const pendientes = (cuotas || []).filter((c) => Number(c.saldoCuota) > 0);
    const primeraCuota = pendientes[0];
    const montoCuota = primeraCuota ? Number(primeraCuota.saldoCuota) : 0;

    App.openModal(
      "Registrar pago",
      `
      <form id="form-pago">
        <input type="hidden" name="prestamo_id" value="${prestamoId}">
        <div class="form-group">
          <label>Tipo de pago</label>
          <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:12px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px;border:1px solid var(--color-border);border-radius:8px">
              <input type="radio" name="tipo_pago" value="cuota" checked>
              <span><strong>Pagar cuota completa</strong> ${
                primeraCuota
                  ? `(Cuota #${primeraCuota.numeroCuota}: $${this.formatNumber(
                      montoCuota
                    )})`
                  : ""
              }</span>
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px;border:1px solid var(--color-border);border-radius:8px">
              <input type="radio" name="tipo_pago" value="abono">
              <span><strong>Abono</strong> (monto libre, se descuenta de la última cuota)</span>
            </label>
          </div>
        </div>
        <div class="form-group" id="abono-monto-wrap" style="display:none">
          <label>Monto del abono *</label>
          <input type="number" name="monto_pagado" min="0.01" step="0.01" placeholder="50000" id="input-monto-pago">
        </div>
        <div id="cuota-info" style="color:var(--color-text-muted);font-size:0.9rem;margin-bottom:16px">
          ${
            primeraCuota
              ? `Se pagará la cuota #${
                  primeraCuota.numeroCuota
                } por $${this.formatNumber(montoCuota)}`
              : "No hay cuotas pendientes"
          }
        </div>
        <div class="form-group">
          <label>Método de pago</label>
          <select name="metodo_pago">
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
        <div class="form-group">
          <label>Referencia</label>
          <input type="text" name="referencia" placeholder="Número de referencia">
        </div>
        <div class="form-group">
          <label>Observación</label>
          <input type="text" name="observacion" placeholder="Observaciones">
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-modal-close>Cancelar</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-pago" ${
            !primeraCuota ? "disabled" : ""
          }>Registrar pago</button>
        </div>
      </form>
    `
    );

    const form = document.getElementById("form-pago");
    form.querySelectorAll('input[name="tipo_pago"]').forEach((r) => {
      r.addEventListener("change", () => {
        const isAbono = form.tipo_pago.value === "abono";
        document.getElementById("abono-monto-wrap").style.display = isAbono
          ? "block"
          : "none";
        document.getElementById("cuota-info").style.display = isAbono
          ? "none"
          : "block";
        document.getElementById("input-monto-pago").required = isAbono;
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let monto = 0;
      if (form.tipo_pago.value === "cuota") {
        monto = montoCuota;
      } else {
        monto = parseFloat(form.monto_pagado?.value);
        if (!monto || monto <= 0) {
          App.showError("Ingresa el monto del abono");
          return;
        }
      }
      const data = {
        monto_pagado: monto,
        es_abono: form.tipo_pago.value === "abono",
        metodo_pago: form.metodo_pago.value || "EFECTIVO",
        referencia: form.referencia.value.trim() || undefined,
        observacion: form.observacion.value.trim() || undefined,
      };
      try {
        const res = await API.registrarPago(prestamoId, data);
        App.toast(
          `Pago registrado: $${this.formatNumber(res.monto_aplicado)} aplicado`
        );
        App.closeModal();
        this.verDetalle(prestamoId);
      } catch (err) {
        App.showError(err.message);
      }
    });
  },

  formatNumber(n) {
    return Number(n).toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  escapeHtml(str) {
    if (str == null) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },
};
