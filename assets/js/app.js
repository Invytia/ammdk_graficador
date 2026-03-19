// ==========================================
// SISTEMA DE ADMINISTRACIÓN AMMDK - app.js
// ==========================================

const Drawer = {
    open: function(content) {
        document.getElementById('drawer-content').innerHTML = content;
        document.getElementById('drawer').classList.add('open');
        document.getElementById('overlay').classList.add('active');
    },
    close: function() {
        document.getElementById('drawer').classList.remove('open');
        document.getElementById('overlay').classList.remove('active');
    }
};

const App = {
    data: { resumen: null, areas: null, graficas: null, alertas: null, ranking: null },

    init: async function() {
        try {
            document.getElementById('main-content').innerHTML = "<h3 style='color:var(--mdk-green); text-align:center; padding:40px; font-family:Montserrat;'>Sincronizando con Google Sheets...</h3>";
            await this.loadData();
            this.renderView('dashboard');
        } catch (error) {
            document.getElementById('main-content').innerHTML = `
                <div style="text-align:center; padding:50px;">
                    <h3 style="color:var(--status-danger); font-family:Montserrat; margin-bottom:15px;">⚠️ Error de Conexión</h3>
                    <p>El sistema no pudo descargar los datos. Revisa la consola o recarga la página.</p>
                </div>`;
        }
    },

    refresh: async function(currentView = 'dashboard') {
        await this.loadData();
        if (currentView === 'ranking') this.cargarRanking();
        else this.renderView(currentView);
    },

    loadData: async function() {
        let resumenData = null, areasData = null, graficasData = null, alertasData = null;
        try {
            if (typeof API !== 'undefined') {
                [resumenData, areasData, graficasData, alertasData] = await Promise.all([
                    API.getResumen().catch(() => null),
                    API.getAreas().catch(() => null),
                    API.getGraficas().catch(() => null),
                    API.getValidaciones().catch(() => null)
                ]);
            }
        } catch(e) { console.error("Error en descarga masiva", e); }

        this.data.resumen = resumenData || {};
        this.data.areas = areasData || [];
        this.data.graficas = graficasData || [];
        this.data.alertas = alertasData || [];
    },

    // AQUI ESTA LA MAGIA REPARADA
    renderView: function(view) {
        const container = document.getElementById('main-content');
        const title = document.getElementById('page-title');
        
        // 1. Limpiamos la pantalla ("borramos el pizarrón")
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#666;">Cargando vista...</div>';
        
        // 2. Intentamos pintar lo nuevo
        try {
            switch(view) {
                case 'dashboard':
                    title.innerText = "Resumen Operativo";
                    container.innerHTML = this.templateDashboard();
                    break;
                case 'areas':
                    title.innerText = "Mapa de Áreas de Competencia";
                    if (typeof Areas !== 'undefined') Areas.render(container);
                    else container.innerHTML = "<p style='color:red; text-align:center; padding:20px;'>Falta el archivo areas.js</p>";
                    break;
                case 'graficas':
                    title.innerText = "Listado de Gráficas";
                    if (typeof Graficas !== 'undefined') Graficas.render(container);
                    else container.innerHTML = "<p style='color:red; text-align:center; padding:20px;'>Falta el archivo graficas.js</p>";
                    break;
                case 'alertas':
                    title.innerText = "Conflictos y Alertas";
                    if (typeof Validacion !== 'undefined') Validacion.render(container);
                    else container.innerHTML = "<p style='color:red; text-align:center; padding:20px;'>Falta el archivo validacion.js</p>";
                    break;
            }
        } catch (error) {
            console.error("Error al pintar la vista:", error);
            container.innerHTML = `<div style="background:white; border-left:5px solid red; padding:20px; margin:20px;">
                <h3 style="color:red; margin-bottom:10px;">⚠️ Error en el código de la vista</h3>
                <p>${error.message}</p>
            </div>`;
        }
    },

    cargarRanking: async function() {
        const tbody = document.getElementById('tabla-ranking-body');
        if(!tbody) return;
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding:20px;'>Cargando puntuaciones...</td></tr>";
        try {
            const rankingData = await API.getRanking();
            if (!rankingData || rankingData.length === 0) {
                tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding:20px;'>No hay resultados.</td></tr>";
                return;
            }
            let html = "";
            rankingData.forEach((escuela, index) => {
                const pos = index + 1;
                let trofeo = pos;
                let clasePosicion = "";
                if (pos === 1) { trofeo = "🏆 1"; clasePosicion = "posicion-oro"; }
                if (pos === 2) { trofeo = "🥈 2"; }
                if (pos === 3) { trofeo = "🥉 3"; }

                html += `<tr class="${clasePosicion}">
                    <td style="text-align:center; font-weight:bold;">${trofeo}</td>
                    <td style="font-weight:bold;">${escuela.escuela || 'Independiente'}</td>
                    <td style="text-align:center;">${escuela.oros || 0}</td>
                    <td style="text-align:center;">${escuela.platas || 0}</td>
                    <td style="text-align:center;">${escuela.bronces || 0}</td>
                    <td style="text-align:right; font-weight:bold; color:var(--mdk-green);">${escuela.puntos_totales || 0}</td>
                </tr>`;
            });
            tbody.innerHTML = html;
        } catch (e) { tbody.innerHTML = "<tr><td colspan='6'>Error de ranking.</td></tr>"; }
    },

    templateDashboard: function() {
        const r = this.data.resumen || {};
        const totalAlertas = Array.isArray(r.alertas) ? r.alertas.length : (r.alertas || 0);

        return `
            <div class="kpi-grid">
                <div class="kpi-card"><h3>Total Alumnos</h3><div class="value">${r.totalAlumnos || 0}</div></div>
                <div class="kpi-card"><h3>Total Gráficas</h3><div class="value">${r.totalGraficas || 0}</div></div>
                <div class="kpi-card" style="border-top-color: var(--status-danger)">
                    <h3>Sin Gráfica</h3>
                    <div class="value" style="color:var(--status-danger)">${r.sinGrafica || 0}</div>
                </div>
                <div class="kpi-card">
                    <h3>Alertas</h3>
                    <div class="value" style="${totalAlertas > 0 ? 'color:var(--status-warn)' : ''}">${totalAlertas}</div>
                </div>
            </div>
            
            <div style="margin-top: 30px; background: white; padding: 25px; border-radius: 4px; border: 1px solid #ddd;">
                <h3 style="color: var(--mdk-green); margin-bottom: 15px; font-family:'Montserrat'">Acciones Rápidas</h3>
                <button onclick="App.triggerGenerar(event)" style="background:var(--mdk-green); color:var(--mdk-yellow); padding: 12px 25px; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; font-family: 'Montserrat'; text-transform:uppercase; transition: 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    ⚡ Generar Gráficas Automáticamente
                </button>
            </div>
        `;
    },

    triggerGenerar: async function(event) {
        if(confirm("¿Seguro de generar gráficas? Esto conectará con Sheets y recalculará todo.")){
            const btn = event.target;
            const texto = btn.innerText;
            btn.innerText = "⏳ Mandando orden a Google... (Espera 5s)";
            btn.disabled = true;
            btn.style.backgroundColor = "#7f8c8d";
            try {
                await API.generarGraficas();
                setTimeout(async () => {
                    alert("¡Gráficas generadas exitosamente!");
                    await App.refresh('dashboard');
                    btn.innerText = texto;
                    btn.disabled = false;
                    btn.style.backgroundColor = "var(--mdk-green)";
                }, 5000);
            } catch(e) { alert("Error de red."); btn.disabled = false; btn.innerText = texto; }
        }
    }
};
