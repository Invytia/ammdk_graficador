// Manejo del Panel Lateral (Drawer)
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

// Motor Principal de la Aplicación
const App = {
    data: {
        resumen: null,
        areas: null,
        graficas: null,
        alertas: null
    },

    init: async function() {
        document.getElementById('main-content').innerHTML = "<h3 style='color:var(--mdk-green); text-align:center; padding:40px; font-family:Montserrat;'>Sincronizando con Google Sheets...</h3>";
        await this.loadData();
        this.renderView('dashboard');
    },

    // NUEVO: Función para recargar los datos silenciosamente sin parpadear la pantalla completa
    refresh: async function(currentView = 'dashboard') {
        console.log("Refrescando datos desde el servidor...");
        await this.loadData();
        this.renderView(currentView);
    },

    loadData: async function() {
        // Intentar cargar desde Apps Script (API)
        let resumenData = null, areasData = null, graficasData = null, alertasData = null;
        
        if (typeof API !== 'undefined') {
            resumenData = await API.getResumen();
            areasData = await API.getAreas();
            graficasData = await API.getGraficas();
            alertasData = await API.getValidaciones();
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

    templateDashboard: function() {
        const r = this.data.resumen;
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
                <button onclick="App.triggerGenerar(event)" style="background:var(--mdk-green); color:var(--mdk-yellow); padding: 12px 25px; font-weight: bold; border: none; cursor: pointer; border-radius: 4px; font-family: 'Montserrat'; text-transform:uppercase; transition: 0.3s;">
                    ⚡ Generar Gráficas Automáticamente
                </button>
            </div>
        `;
    },

    // CORREGIDO: Ahora sí se comunica con Google para generar las gráficas
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
                alert("El servidor está procesando demasiados datos en segundo plano. Refresca la página en 1 minuto.");
            } finally {
                btn.innerText = textoOriginal;
                btn.disabled = false;
                btn.style.backgroundColor = "var(--mdk-green)";
            }
        }
    }
};
