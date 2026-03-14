// ==========================================
// CONEXIÓN MAESTRA AMMDK v6.0
// ==========================================

/**
 * El API utiliza la URL configurada en el index.html para mayor flexibilidad.
 * Usa tu URL más reciente como respaldo.
 */
const WEB_APP_URL = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) 
    ? window.APP_CONFIG.WEB_APP_URL 
    : "https://script.google.com/macros/s/AKfycby8qJjsSir7OtawmfjJRipPLxueTSHa9XRXhWbGGk2nqe-tOm8GhYnrLhGFfZ-w7-__/exec";

const API = {
    // ---------------------------------------------------
    // MOTOR DE PETICIONES (NÚCLEO CON ANTI-CACHÉ)
    // ---------------------------------------------------
    async peticionGET(accion, parametrosExtra = "") {
        try {
            // Generamos un sello de tiempo para obligar a Google a dar datos frescos
            const antiCache = `&_ts=${new Date().getTime()}`;
            const urlCompleta = `${WEB_APP_URL}?action=${accion}${parametrosExtra}${antiCache}`;
            
            const respuesta = await fetch(urlCompleta);
            if (!respuesta.ok) throw new Error('Error en la respuesta del servidor');
            
            const datos = await respuesta.json();
            return datos;
        } catch (error) {
            console.error(`[API ERROR] Falló la descarga de (${accion}):`, error);
            return null;
        }
    },

    async peticionPOST(datos) {
        try {
            const respuesta = await fetch(WEB_APP_URL, {
                method: 'POST',
                // text/plain es necesario para evitar bloqueos de CORS en Google Apps Script
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(datos)
            });
            return await respuesta.json();
        } catch (error) {
            console.error(`[API ERROR] No se pudo enviar la información:`, error);
            return { ok: false, error: error.message };
        }
    },

    // ---------------------------------------------------
    // FUNCIONES DE LECTURA (GET)
    // ---------------------------------------------------
    
    // Crucial para llenar los KPIs del Dashboard (Total Alumnos, Gráficas, etc.)
    getResumen: async function() { 
        return await this.peticionGET('resumen'); 
    },
    
    getAreas: async function() { 
        return await this.peticionGET('areas'); 
    },
    
    getGraficas: async function() { 
        return await this.peticionGET('graficas'); 
    },
    
    getRanking: async function() { 
        // Alimenta la tabla de posiciones por escuela
        return await this.peticionGET('ranking'); 
    },
    
    buscarAlumno: async function(q) { 
        return await this.peticionGET('buscar', `&q=${encodeURIComponent(q)}`); 
    },

    // ---------------------------------------------------
    // FUNCIONES DE ESCRITURA (POST)
    // ---------------------------------------------------
    
    // Dispara el motor de generación de gráficas desde la web
    generarGraficas: async function() {
        return await this.peticionPOST({ 
            action: 'generar' 
        });
    },

    // Usada por Jueces y Administrador para cerrar combates
    registrarResultado: async function(id_grafica, resultados) {
        return await this.peticionPOST({
            action: 'registrar_resultado',
            id_grafica: id_grafica,
            resultados: resultados
        });
    }
};

// Exponemos la API globalmente
window.API = API;
