// ==========================================
// CONEXIÓN DIRECTA A GOOGLE APPS SCRIPT
// ==========================================

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbykVKjXgHY_hykZ4WXficxYCWlAiekgUYsyFqn-8-6hV64pQvSgdHOsPGUZdsN4EFZLDg/exec";

const API = {
    // ---------------------------------------------------
    // MOTOR DE PETICIONES (GET)
    // ---------------------------------------------------
    async peticionGET(accion, parametrosExtra = "") {
        try {
            // Usamos window.APP_CONFIG si existe, si no la URL local
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            const urlCompleta = `${baseUrl}?action=${accion}${parametrosExtra}&t=${Date.now()}`;
            
            // Petición simplificada para evitar bloqueos CORS de Google
            const respuesta = await fetch(urlCompleta, {
                method: 'GET',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!respuesta.ok) throw new Error('Respuesta de red no válida');
            
            const datos = await respuesta.json();
            console.log(`[API] Datos recibidos para ${accion}:`, datos);
            return datos;
        } catch (error) {
            console.error(`[API] Error descargando (${accion}):`, error);
            // IMPORTANTE: Lanzamos el error para que el Panel de Juez muestre la alerta
            throw error; 
        }
    },

    // ---------------------------------------------------
    // MOTOR DE PETICIONES (POST)
    // ---------------------------------------------------
    async peticionPOST(datos) {
        try {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            
            // Google Apps Script requiere 'no-cors' para recibir POST desde otros dominios
            await fetch(baseUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(datos)
            });
            
            // Con no-cors no podemos leer la respuesta, pero el dato llega a la hoja
            return { ok: true }; 
        } catch (error) {
            console.error(`[API] Error enviando datos:`, error);
            return { ok: false, error: error.message };
        }
    },

    // --- FUNCIONES DE LECTURA ---
    getResumen: async function() { return await this.peticionGET('resumen'); },
    getAreas: async function() { return await this.peticionGET('areas'); },
    getGraficas: async function() { return await this.peticionGET('graficas'); },
    getValidaciones: async function() { return await this.peticionGET('validaciones'); },
    getRanking: async function() { return await this.peticionGET('ranking'); },
    buscarAlumno: async function(q) { return await this.peticionGET('buscar', `&q=${encodeURIComponent(q)}`); },

    // --- FUNCIONES DE ESCRITURA ---
    generarGraficas: async function() {
        return await this.peticionPOST({ action: 'generar' });
    },

    registrarResultado: async function(id_grafica, resultados) {
        return await this.peticionPOST({
            action: 'registrar_resultado',
            id_grafica: id_grafica,
            resultados: resultados
        });
    }
};

window.API = API;
