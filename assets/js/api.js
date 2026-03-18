// ==========================================
// CONEXIÓN DIRECTA A GOOGLE APPS SCRIPT
// ==========================================

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbykVKjXgHY_hykZ4WXficxYCWlAiekgUYsyFqn-8-6hV64pQvSgdHOsPGUZdsN4EFZLDg/exec";

const API = {
    async peticionGET(accion, parametrosExtra = "") {
        try {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            const urlCompleta = `${baseUrl}?action=${accion}${parametrosExtra}&t=${Date.now()}`;
            
            const respuesta = await fetch(urlCompleta);
            if (!respuesta.ok) throw new Error('Falló la red');
            return await respuesta.json();
        } catch (error) {
            console.error(`[API] Error descargando (${accion}):`, error);
            throw error;
        }
    },

    async peticionPOST(datos) {
        try {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            const respuesta = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(datos)
            });
            // Google redirecciona el POST, si llega aquí el envío fue exitoso
            return { ok: true }; 
        } catch (error) {
            console.error(`[API] Error enviando datos:`, error);
            return { ok: false, error: error.message };
        }
    },

    getResumen: async function() { return await this.peticionGET('resumen'); },
    getAreas: async function() { return await this.peticionGET('areas'); },
    getGraficas: async function() { return await this.peticionGET('graficas'); },
    getValidaciones: async function() { return await this.peticionGET('validaciones'); },
    getRanking: async function() { return await this.peticionGET('ranking'); },
    buscarAlumno: async function(q) { return await this.peticionGET('buscar', `&q=${encodeURIComponent(q)}`); },

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
