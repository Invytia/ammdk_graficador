// ==========================================
// CONEXIÓN DIRECTA A GOOGLE APPS SCRIPT
// ==========================================

// Aquí tatuamos tu nueva URL para que nada pueda fallar
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzF0IPxmI0Sw-MBNsALUxOCWqQLcsgpVDKn_LHUcmOhPHRxfhu_G6RR4Y3xRbEFrzaXdA/exec";

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
                // Google Sheets recibe mejor las peticiones en texto plano para evitar bloqueos CORS
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
        // Esta es la función clave que pedirá la tabla de posiciones
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
        // Esta función envía las medallas al servidor
        return await this.peticionPOST({
            action: 'registrar_resultado',
            id_grafica: id_grafica,
            resultados: resultados
        });
    }
};

// Exponemos la API globalmente para que app.js y jueces.js puedan usarla
window.API = API;
