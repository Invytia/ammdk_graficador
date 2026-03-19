/**
 * SISTEMA DE API AMMDK - v3.1 (Conexión Libre)
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxlFiasgSVVYoL0sd4vWfmYjmWGX8VPqZihdXm8i8-yVS0YYxs-1FrUgIO-ILjL9iLYKg/exec";

const API = {
    // ---------------------------------------------------
    // MOTOR DE PETICIONES GET (SIN BLOQUEOS)
    // ---------------------------------------------------
    async peticionGET(accion, parametrosExtra = "") {
        try {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            const urlCompleta = `${baseUrl}?action=${accion}${parametrosExtra}&t=${Date.now()}`;
            
            // SOLUCIÓN: Fetch simple, sin headers que hagan enojar a Google
            const respuesta = await fetch(urlCompleta);

            if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
            
            const datos = await respuesta.json();
            console.log(`[API SUCCESS] ${accion}:`, datos);
            return datos;

        } catch (error) {
            console.error(`[API ERROR] Falló la descarga de ${accion}:`, error);
            throw error; 
        }
    },

    // ---------------------------------------------------
    // MOTOR DE PETICIONES POST
    // ---------------------------------------------------
    async peticionPOST(datos) {
        try {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            
            await fetch(baseUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(datos)
            });

            return { ok: true, msg: "Envío realizado" };

        } catch (error) {
            console.error("[API ERROR] Error en envío de datos:", error);
            return { ok: false, error: error.message };
        }
    },

    // --- LECTURA ---
    async getResumen() { return await this.peticionGET('resumen'); },
    async getAreas() { return await this.peticionGET('areas'); },
    async getGraficas() { return await this.peticionGET('graficas'); },
    async getRanking() { return await this.peticionGET('ranking'); },
    async getValidaciones() { return await this.peticionGET('validaciones'); },
    async buscarAlumno(nombre) { return await this.peticionGET('buscar', `&q=${encodeURIComponent(nombre)}`); },

    // --- ESCRITURA ---
    async generarGraficas() { return await this.peticionPOST({ action: 'generar' }); },
    async registrarResultado(idGrafica, resultados) {
        return await this.peticionPOST({
            action: 'registrar_resultado',
            id_grafica: idGrafica,
            resultados: resultados
        });
    }
};

window.API = API;
