// ==========================================
// CONEXIÓN DIRECTA A GOOGLE APPS SCRIPT
// ==========================================

/**
 * El API utiliza la URL configurada en el index.html para mayor flexibilidad.
 * Si por alguna razón falla, usa el respaldo directo.
 */
const WEB_APP_URL = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) 
    ? window.APP_CONFIG.WEB_APP_URL 
    : "https://script.google.com/macros/s/AKfycbwXH0jAOG__tp9BUhAB8aBmbgErcjLXqYo177L9yAm7hzgvDa5qDl44OgRVBhMbF5XgHQ/exec";

const API = {
    // ---------------------------------------------------
    // MOTOR DE PETICIONES (NÚCLEO)
    // ---------------------------------------------------
    async peticionGET(accion, parametrosExtra = "") {
        try {
            // Agregamos un buster de caché para que no de datos viejos
            const cacheBuster = `&_cb=${new Date().getTime()}`;
            const urlCompleta = `${WEB_APP_URL}?action=${accion}${parametrosExtra}${cacheBuster}`;
            
            const respuesta = await fetch(urlCompleta);
            if (!respuesta.ok) throw new Error('Error en la respuesta de red');
            
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
                // Usamos text/plain para evitar problemas de CORS con Google Apps Script
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
    getResumen: async function() { 
        return await this.peticionGET('resumen'); 
    },
    
    getAreas: async function() { 
        return await this.peticionGET('areas'); 
    },
    
    getGraficas: async function() { 
        return await this.peticionGET('graficas'); 
    },
    
    getValidaciones: async function() { 
        return await this.peticionGET('validaciones'); 
    },
    
    getRanking: async function() { 
        // Esta función alimenta la tabla de Campeonato por Escuelas
        return await this.peticionGET('ranking'); 
    },
    
    buscarAlumno: async function(q) { 
        return await this.peticionGET('buscar', `&q=${encodeURIComponent(q)}`); 
    },

    // ---------------------------------------------------
    // FUNCIONES DE ESCRITURA (POST)
    // ---------------------------------------------------
    generarGraficas: async function() {
        return await this.peticionPOST({ 
            action: 'generar' 
        });
    },

    registrarResultado: async function(id_grafica, resultados) {
        return await this.peticionPOST({
            action: 'registrar_resultado',
            id_grafica: id_grafica,
            resultados: resultados
        });
    }
};

// Exponemos la API globalmente para que sea accesible desde otros scripts
window.API = API;
