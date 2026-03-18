// ==========================================
// CONEXIÓN DIRECTA A GOOGLE APPS SCRIPT
// ==========================================

// URL DEFINITIVA AMMDK
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbykVKjXgHY_hykZ4WXficxYCWlAiekgUYsyFqn-8-6hV64pQvSgdHOsPGUZdsN4EFZLDg/exec";

const API = {
    // ---------------------------------------------------
    // MOTOR DE PETICIONES (GET)
    // ---------------------------------------------------
    async peticionGET(accion, parametrosExtra = "") {
        try {
            // Priorizamos la URL de la configuración global si existe, si no usamos la local
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            const urlCompleta = `${baseUrl}?action=${accion}${parametrosExtra}`;
            
            const respuesta = await fetch(urlCompleta, {
                method: 'GET',
                mode: 'cors', // Forzamos modo CORS para evitar bloqueos
                headers: { 'Content-Type': 'application/json' }
            });

            if (!respuesta.ok) throw new Error('Falló la red o permisos');
            return await respuesta.json();
        } catch (error) {
            console.error(`[API] Error descargando (${accion}):`, error);
            throw error; // Lanzamos el error para que el "catch" de juez.html lo vea
        }
    },

    // ---------------------------------------------------
    // MOTOR DE PETICIONES (POST)
    // ---------------------------------------------------
    async peticionPOST(datos) {
        try {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            const respuesta = await fetch(baseUrl, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script requiere a veces no-cors para POST simples
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(datos)
            });
            // Nota: con no-cors no podemos leer la respuesta, pero el envío se hace.
            return { ok: true }; 
        } catch (error) {
            console.error(`[API] Error enviando datos:`, error);
            return { ok: false, error: error.message };
        }
    },

    // ---------------------------------------------------
    // FUNCIONES DE LECTURA
    // ---------------------------------------------------
    getResumen: async function() { return await this.peticionGET('resumen'); },
    getAreas: async function() { return await this.peticionGET('areas'); },
    getGraficas: async function() { return await this.peticionGET('graficas'); },
    getValidaciones: async function() { return await this.peticionGET('validaciones'); },
    getRanking: async function() { return await this.peticionGET('ranking'); },
    
    buscarAlumno: async function(q) { 
        return await this.peticionGET('buscar', `&q=${encodeURIComponent(q)}`); 
    },

    // ---------------------------------------------------
    // FUNCIONES DE ESCRITURA
    // ---------------------------------------------------
    generarGraficas: async function() {
        return await this.peticionPOST({ action: 'generar' });
    },

    registrarResultado: async function(id_grafica, resultados) {
        // Ajustamos la petición POST para que espere respuesta si es posible
        try {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            const res = await fetch(`${baseUrl}?action=registrar_resultado`, {
                method: 'POST',
                body: JSON.stringify({
                    id_grafica: id_grafica,
                    resultados: resultados
                })
            });
            return { ok: true };
        } catch (e) {
            return { ok: false };
        }
    }
};

// Exponemos la API globalmente
window.API = API;
