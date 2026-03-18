// ==========================================
// Manejo del Panel Lateral (Drawer)
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

// ==========================================
// Motor Principal de la Aplicación (App)
// ==========================================
const App = {
    data: {
        resumen: null,
        areas: null,
        graficas: null,
        alertas: null,
        ranking: null
    },

    init: async function() {
        try {
            document.getElementById('main-content').innerHTML = "<h3 style='color:var(--mdk-green); text-align:center; padding:40px; font-family:Montserrat;'>Sincronizando con Google Sheets...</h3>";
            await this.loadData();
            this.renderView('dashboard');
        } catch (error) {
            console.error("[App Init] Error fatal:", error);
            document.getElementById('main-content').innerHTML = `
                <div style="text-align:center; padding:50px;">
                    <h3 style="color:var(--status-danger); font-family:Montserrat; margin-bottom:15px;">⚠️ Error de Conexión</h3>
                    <p>El sistema no pudo descargar los datos de Google Sheets. Asegúrate de haber dado los permisos necesarios.</p>
                    <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; background:var(--mdk-green); color:white; border:none; border-radius:4px; cursor:pointer;">Reintentar</button>
                </div>`;
        }
    },

    // Función para recargar los datos silenciosamente
    refresh: async function(currentView = 'dashboard') {
        console.log("Refrescando datos desde el servidor...");
        await this.loadData();
        if (currentView === 'ranking') {
            this.cargarRanking();
        } else {
            this.renderView(currentView);
        }
    },

    // OPTIMIZADO: Descarga en paralelo (Modo Turbo) con escudo de errores
    loadData: async function() {
        let resumenData = null, areasData = null, graficasData = null, alertasData = null;
        
        try {
            if (typeof API !== 'undefined') {
                // Promise.all permite que las 4 descargas ocurran al mismo tiempo
                [resumenData, areasData, graficasData, alertasData] = await Promise.all([
                    API.getResumen().catch(() => null),
                    API.getAreas().catch(() => null),
                    API.getGraficas().catch(() => null),
                    API.getValidaciones().catch(() => null)
                ]);
            }
        } catch(e) {
            console.error("Error en la descarga masiva de datos", e);
        }

        // Fallback a MOCK_DATA si la API falla o no está lista
        this.data.resumen = resumenData || (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.resumen : {});
        this.data.areas = areasData || (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.areas : []);
        this.data.graficas = graficasData || (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.graficas : []);
        this.data.alertas = alertasData || (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.alertas : []);
    },

    renderView: function(view) {
        const container = document.getElementById('main-content');
        const title = document.getElementById('page-title');
        
        switch(view) {
            case 'dashboard':
                title.innerText = "Resumen Operativo";
                container.innerHTML = this.templateDashboard();
                break;
            case 'areas':
                title.innerText = "Mapa de Áreas de Competencia";
                if (typeof Areas !== 'undefined') Areas.render(container);
                break;
            case 'graficas':
                title.innerText = "Listado de Gráficas";
                if (typeof Graficas !== 'undefined') Graficas.render(container);
                break;
            case 'alertas':
                title.innerText = "Conflictos y Alertas";
                if (typeof Validacion !== 'undefined') Validacion.render(container);
                break;
        }
    },

    // NUEVA FUNCIÓN: Se conecta con el index.html para pintar el medallero
    cargarRanking: async function() {
        const tbody = document.getElementById('tabla-ranking-body');
        if(!tbody) return;
        
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding:20px;'>Cargando puntuaciones...</td></tr>";
        
        try {
            const rankingData = await API.getRanking();
            this.data.ranking = rankingData;

            if (!rankingData || rankingData.length === 0) {
                tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; padding:20px; color:#666;'>No hay resultados registrados aún en el torneo.</td></tr>";
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

                html += `
                    <tr class="${clasePosicion}">
                        <td style="font-weight:bold; text-align:center; font-size:1.1rem;">${trofeo}</td>
                        <td style="font-weight:bold; color:var(--mdk-black);">${escuela.escuela || 'Independiente'}</td>
                        <td style="text-align:center;">${escuela.oros || 0}</td>
                        <td style="text-align:center;">${escuela.platas || 0}</td>
                        <td style="text-align:center;">${escuela.bronces || 0}</td>
                        <td style="text-align:right; font-weight:bold; font-size:1.2rem; color:var(--mdk-green);">${escuela.puntos_totales || 0}</td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        } catch (error) {
            console.error("Error al cargar ranking", error);
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red; padding:20px;'>Error al cargar los datos del Ranking. Revisa la conexión.</td></tr>";
        }
    },

    templateDashboard: function() {
        const r = this.data.resumen || {};
        // Validación de seguridad por si alertas es un array o un número
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
        if(confirm("¿Estás seguro de generar nuevas gráficas? Esto conectará con tu Google Sheets y recalculará todo.")){
            const btn = event.target;
            const textoOriginal = btn.innerText;
            btn.innerText = "⚙️ Procesando en el servidor (Modo Turbo)...";
            btn.disabled = true;
            btn.style.backgroundColor = "#7f8c8d";

            try {
                const respuesta = await API.generarGraficas();
                if(respuesta && respuesta.ok) {
                    alert("¡Gráficas generadas y áreas asignadas exitosamente!");
                    await this.refresh('dashboard'); // Recarga los datos y vuelve a pintar los KPIs
                } else {
                    alert("Hubo un error al generar las gráficas.");
                }
            } catch(e) {
                alert("El servidor está procesando la solicitud. Refresca la página en unos segundos.");
            } finally {
                btn.innerText = textoOriginal;
                btn.disabled = false;
                btn.style.backgroundColor = "var(--mdk-green)";
            }
        }
    }
};
