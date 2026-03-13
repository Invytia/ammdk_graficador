let graficaActivaParaJuez = null;

// ==========================================
// VENTANA DEL JUEZ
// ==========================================
function abrirModalJuez(idGrafica) {
    if (!window.datosGlobalesGraficas) {
        alert("Aún no cargan los datos. Espera un segundo.");
        return;
    }
    
    const grafica = window.datosGlobalesGraficas.find(g => String(g.id) === String(idGrafica));
    if (!grafica) {
        alert("Error al cargar la gráfica");
        return;
    }

    graficaActivaParaJuez = grafica.id;
    document.getElementById('juez-grafica-info').innerText = `Categoría: ${grafica.categoria} | Cinta: ${grafica.cinta}`;

    let opcionesHTML = `<option value="">-- Selecciona un competidor --</option>`;
    
    // Soporte para ambos formatos de datos (por si acaso)
    let listaC = grafica.competidores_data || [];
    if (listaC.length === 0 && grafica.competidores) {
        listaC = grafica.competidores.map(nombre => ({ id: nombre, nombre: nombre }));
    }

    if (listaC && listaC.length > 0) {
        listaC.forEach(comp => {
            const elId = comp.id || comp;
            const elNom = comp.nombre || comp;
            opcionesHTML += `<option value="${elId}">${elNom}</option>`;
        });
    }

    ['oro', 'plata', 'bronce1', 'bronce2'].forEach(medalla => {
        const select = document.getElementById(`select-${medalla}`);
        if(select) select.innerHTML = opcionesHTML;
    });

    document.getElementById('modal-juez').style.display = 'flex';
}

function cerrarModalJuez() {
    document.getElementById('modal-juez').style.display = 'none';
    graficaActivaParaJuez = null;
}

// ==========================================
// GUARDAR MEDALLAS EN GOOGLE SHEETS
// ==========================================
async function guardarResultados() {
    // Tomamos el botón directamente
    const btn = document.querySelector('.btn-guardar-juez');
    if(btn) {
        btn.innerText = "Guardando en servidor...";
        btn.disabled = true;
    }

    const resultados = {
        oro: document.getElementById('select-oro').value,
        plata: document.getElementById('select-plata').value,
        bronce1: document.getElementById('select-bronce1').value,
        bronce2: document.getElementById('select-bronce2').value
    };

    try {
        console.log("Intentando guardar medallas. ID:", graficaActivaParaJuez);
        console.log("Resultados:", resultados);

        // Llamamos a la API
        const respuesta = await window.API.registrarResultado(graficaActivaParaJuez, resultados);
        
        console.log("El servidor respondió:", respuesta);
        
        if (respuesta && respuesta.ok) {
            alert("¡Resultados guardados! Puntuación actualizada.");
            cerrarModalJuez();
            
            // TRUCO INFALIBLE: Recargar la página entera para forzar a que tu app.js 
            // descargue el estado "FINALIZADA" y el nuevo ranking desde cero.
            window.location.reload(); 
        } else {
            alert("Error al guardar: " + (respuesta.error || "El servidor rechazó la solicitud"));
        }
    } catch(e) {
        console.error("Falló la conexión de red:", e);
        alert("Error de red. Abre la consola de tu navegador para ver los detalles.");
    } finally {
        if(btn) {
            btn.innerText = "Guardar y Actualizar Puntos";
            btn.disabled = false;
        }
    }
}

// ==========================================
// VISTA DE RANKING
// ==========================================
async function mostrarRanking(event) {
    // Iluminar el botón correcto en el menú
    if(event && event.target) {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
    }

    // Ocultar la pantalla normal y encender la del ranking
    const mc = document.getElementById('main-content');
    if (mc) mc.style.display = 'none';
    
    const vr = document.getElementById('vista-ranking');
    if (vr) vr.style.display = 'block';
    
    const tbody = document.getElementById('tabla-ranking-body');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Cargando posiciones desde Google... ⏳</td></tr>`;

    try {
        console.log("Pidiendo los datos del Ranking...");
        const datosRanking = await window.API.getRanking();
        console.log("Ranking recibido:", datosRanking);
        
        if (!datosRanking || datosRanking.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color:#666;">Aún no hay puntos registrados. ¡Asigna medallas en el Listado de Gráficas!</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        datosRanking.forEach((escuela, index) => {
            let medallaPosicion = `<strong style="font-size: 1.2rem; color: #7f8c8d;">${index + 1}</strong>`;
            if(index === 0) medallaPosicion = "<span style='font-size: 1.5rem;'>🥇</span>";
            if(index === 1) medallaPosicion = "<span style='font-size: 1.5rem;'>🥈</span>";
            if(index === 2) medallaPosicion = "<span style='font-size: 1.5rem;'>🥉</span>";

            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 15px; text-align:center;">${medallaPosicion}</td>
                    <td style="padding: 15px; font-weight: bold; color: var(--mdk-black);">${escuela.escuela || 'Independiente'}</td>
                    <td style="padding: 15px; text-align: center; color: #d4af37; font-weight: bold; font-size: 1.1rem;">${escuela.oros || 0}</td>
                    <td style="padding: 15px; text-align: center; color: #95a5a6; font-weight: bold; font-size: 1.1rem;">${escuela.platas || 0}</td>
                    <td style="padding: 15px; text-align: center; color: #cd7f32; font-weight: bold; font-size: 1.1rem;">${escuela.bronces || 0}</td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; color: var(--mdk-green); font-size: 1.3rem;">${escuela.puntos_totales} pts</td>
                </tr>
            `;
        });
    } catch(e) {
        console.error("Error al pintar la tabla de ranking:", e);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:red;">Fallo al conectar con Google Sheets.</td></tr>`;
    }
}

function cerrarRanking() {
    const vr = document.getElementById('vista-ranking');
    if (vr) vr.style.display = 'none';
    
    const mc = document.getElementById('main-content');
    if (mc) mc.style.display = 'block';
    
    // Simular clic en el Resumen General para resetear visualmente
    const primerBoton = document.querySelector('.nav-item');
    if (primerBoton) primerBoton.click();
}
