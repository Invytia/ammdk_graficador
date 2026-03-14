// ==========================================
// CONEXIÓN DIRECTA A GOOGLE APPS SCRIPT
// ==========================================

// ¡NUEVA URL DEFINITIVA!
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby8qJjsSir7OtawmfjJRipPLxueTSHa9XRXhWbGGk2nqe-tOm8GhYnrLhGFfZ-w7-__/exec";

const API = {
    // ---------------------------------------------------
    // MOTOR DE PETICIONES
    // ---------------------------------------------------
    async peticionGET(accion, parametrosExtra = "") {
        try {
            const urlCompleta = `${WEB_APP_URL}?action=${accion}${parametrosExtra}`;
            const respuesta = await fetch(urlCompleta);
            if (!respuesta.ok) throw new Error('Falló la red');
            return await respuesta.json();
        } catch (error) {
            console.error(`[API] Error descargando (${accion}):`, error);
            return null;
        }
    },

    async peticionPOST(datos) {
        try {
            const respuesta = await fetch(WEB_APP_URL, {
                method: 'POST',
                // Importante para Google Sheets: text/plain para evitar bloqueos
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(datos)
            });
            return await respuesta.json();
        } catch (error) {
            console.error(`[API] Error enviando datos:`, error);
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

// Exponemos la API globalmente
window.API = API;
