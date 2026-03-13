const API = {
    fetchData: async (action, params = "") => {
        // Truco de ingeniería para evitar el caché: agregar la hora exacta en milisegundos
        const timeStamp = new Date().getTime();
        const url = `${window.APP_CONFIG.WEB_APP_URL}?action=${action}${params}&t=${timeStamp}`;
        
        try {
            const response = await fetch(url, { 
                method: "GET", 
                redirect: "follow" 
            });
            
            if (!response.ok) throw new Error("Error de red al conectar con Google");
            
            return await response.json();
        } catch (error) {
            console.warn(`[API] Falló la conexión al endpoint: ${action}.`, error);
            return null; 
        }
    },

    postData: async (action, payload) => {
        try {
            const response = await fetch(`${window.APP_CONFIG.WEB_APP_URL}?action=${action}`, {
                method: "POST",
                redirect: "follow",
                // CRÍTICO para saltar la seguridad CORS de Google
                headers: { "Content-Type": "text/plain;charset=utf-8" }, 
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error(`[API POST Error en ${action}]:`, error);
            throw error;
        }
    },

    // ==========================================
    // ENDPOINTS DE LECTURA (GET)
    // ==========================================
    getResumen: async () => await API.fetchData("resumen"),
    getAreas: async () => await API.fetchData("areas"),
    getGraficas: async () => await API.fetchData("graficas"),
    getValidaciones: async () => await API.fetchData("validaciones"),
    buscarAlumno: async (q) => await API.fetchData("buscar", `&q=${encodeURIComponent(q)}`),
    getRanking: async () => await API.fetchData("ranking"), // NUEVO: Obtiene la tabla de posiciones
    
    // ==========================================
    // ENDPOINTS DE ESCRITURA (POST)
    // ==========================================
    generarGraficas: async () => await API.postData("generar", { ejecutar: true }),
    moverGrafica: async (idGrafica, idArea) => await API.postData("mover", { grafica: idGrafica, nuevaArea: idArea }),
    registrarResultado: async (idGrafica, resultados) => await API.postData("registrar_resultado", { id_grafica: idGrafica, resultados: resultados }) // NUEVO: Guarda las medallas
};