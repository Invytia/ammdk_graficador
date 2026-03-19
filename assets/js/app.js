// ==========================================
// SISTEMA DE ADMINISTRACIÓN AMMDK - app.js v3.0
// Motor principal de renderizado y datos
// ==========================================

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
        try {
            document.getElementById('main-content').innerHTML = "<h3 style='color:var(--mdk-green); text-align:center; padding:40px; font-family:Montserrat;'>Sincronizando con Google Sheets...</h3>";
            await this.loadData();
            this.renderView('dashboard');
        } catch (error) {
            console.error("[App Init] Error fatal:", error);
            document.getElementById('main-content').innerHTML = `
                <div style="text-align:center; padding:50px;">
                    <h3 style="color:var(--status-danger); font-family:Montserrat; margin-bottom:15px;">⚠️ Error de Conexión</h3>
                    <p>El sistema no pudo descargar los datos de Google Sheets. Asegúrate de haber dado los permisos necesarios a la App Web.</p>
                    <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; background:var(--mdk-green); color:white; border:none; border-radius:4px; cursor:pointer;">Reintentar Sincronización</button>
                </div>`;
        }
    },

    // OPTIMIZADO: Carga en paralelo (Promise.all) para máxima velocidad
    refresh: async function(currentView = 'dashboard') {
        console.log("Refrescando datos desde el servidor...");
        await this.loadData();
        this.renderView(currentView);
    },

    loadData: async function() {
        // Intentar cargar desde Apps Script (API)
        let resumenData = null, areasData = null, graficasData = null, alertasData = null;
        
        try {
            if (typeof API !== 'undefined') {
                // Descargamos los 4 bloques de datos al mismo tiempo
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

    // OPTIMIZADO: KPIs estilizados y el mapa de áreas con bordes distintivos
    templateDashboard: function() {
        const r = this.data.resumen || {}; // Manejo de objeto vacío de seguridad
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

    // OPTIMIZADO: Manejo de errores en la generación remota
    triggerGenerar: async function(event) {
        if(confirm("¿Estás seguro de generar nuevas gráficas? Esto conectará con tu Google Sheets y recalculará todo.")){
            const btn = event.target;
            const textoOriginal = btn.innerText;
            btn.innerText = "⚙️ Mandando orden a Google...";
            btn.disabled = true;
            btn.style.backgroundColor = "#7f8c8d";

            try {
                // Mandamos la orden (es instantáneo)
                await API.generarGraficas();
                
                // Cambiamos el texto para que sepas qué está pasando
                btn.innerText = "⏳ Escribiendo en Excel... (Espera 4s)";
                
                // Le damos 4.5 segundos a Google Sheets para que termine su magia
                setTimeout(async () => {
                    alert("¡Gráficas generadas y áreas asignadas exitosamente!");
                    await App.refresh('dashboard'); // Ahora sí, refrescamos
                    
                    btn.innerText = textoOriginal;
                    btn.disabled = false;
                    btn.style.backgroundColor = "var(--mdk-green)";
                }, 4500); 

            } catch(e) {
                alert("Hubo un problema de red al enviar la orden.");
                btn.innerText = textoOriginal;
                btn.disabled = false;
                btn.style.backgroundColor = "var(--mdk-green)";
            }
        }
    }
