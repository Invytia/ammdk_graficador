/**
 * SISTEMA DE API AMMDK - v3.0
 * Conexión optimizada para Google Apps Script y GitHub Pages.
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxlFiasgSVVYoL0sd4vWfmYjmWGX8VPqZihdXm8i8-yVS0YYxs-1FrUgIO-ILjL9iLYKg/exec";

const API = {
    /**
     * Motor de Peticiones GET
     * Obtiene datos de la hoja de cálculo.
     */
    async peticionGET(accion, parametrosExtra = "") {
        try {
            // Priorizamos la URL global del index/juez, si no usamos la local
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            
            // Añadimos cache-buster (?t=...) para que el navegador no guarde errores viejos
            const urlCompleta = `${baseUrl}?action=${accion}${parametrosExtra}&t=${Date.now()}`;
            
            const respuesta = await fetch(urlCompleta, {
                method: 'GET',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
            
            const datos = await respuesta.json();
            console.log(`[API SUCCESS] ${accion}:`, datos);
            return datos;

        } catch (error) {
            console.error(`[API ERROR] Falló la descarga de ${accion}:`, error);
            // Re-lanzamos el error para que la UI (index/juez) pueda mostrar la alerta al usuario
            throw error; 
        }
    },

    /**
     * Motor de Peticiones POST
     * Envía datos (como resultados de jueces) a Google Sheets.
     */
    async peticionPOST(datos) {
        try {
            const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.WEB_APP_URL) ? window.APP_CONFIG.WEB_APP_URL : WEB_APP_URL;
            
            // Google Apps Script requiere 'no-cors' para recibir JSON puro desde dominios externos sin pre-flight
            await fetch(baseUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(datos)
            });

            // En modo 'no-cors' la respuesta es opaca, pero si llegamos aquí, el envío salió del navegador
            return { ok: true, msg: "Envío realizado (modo opaco)" };

        } catch (error) {
            console.error("[API ERROR] Error en envío de datos:", error);
            return { ok: false, error: error.message };
        }
    },

    // --- FUNCIONES DE LECTURA (Dashboard y Juez) ---
    
    async getResumen() { return await this.peticionGET('resumen'); },
    
    async getAreas() { return await this.peticionGET('areas'); },
    
    async getGraficas() { return await this.peticionGET('graficas'); },
    
    async getRanking() { return await this.peticionGET('ranking'); },
    
    async getValidaciones() { return await this.peticionGET('validaciones'); },
    
    async buscarAlumno(nombre) { 
        return await this.peticionGET('buscar', `&q=${encodeURIComponent(nombre)}`); 
    },

    // --- FUNCIONES DE ESCRITURA (Acciones) ---

    async generarGraficas() {
        return await this.peticionPOST({ action: 'generar' });
    },

    async registrarResultado(idGrafica, resultados) {
        return await this.peticionPOST({
            action: 'registrar_resultado',
            id_grafica: idGrafica,
            resultados: resultados
        });
    }
};

// Exportamos al objeto global window para que app.js y juez.html puedan usarlo
window.API = API;
