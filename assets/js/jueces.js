let graficaActivaParaJuez = null;

// ==========================================
// MÓDULO DE JUECES (ASIGNAR MEDALLAS)
// ==========================================

function abrirModalJuez(idGrafica) {
    // Buscar la gráfica en los datos cargados previamente en la vista
    const grafica = window.datosGlobalesGraficas.find(g => g.id === idGrafica);
    if(!grafica) return alert("Error al cargar la gráfica");

    graficaActivaParaJuez = grafica.id;
    document.getElementById('juez-grafica-info').innerText = `Categoría: ${grafica.categoria} | Cinta: ${grafica.cinta}`;

    // Construir las opciones con los 4 competidores
    let opcionesHTML = `<option value="">-- Selecciona un competidor --</option>`;
    grafica.competidores_data.forEach(comp => {
        opcionesHTML += `<option value="${comp.id}">${comp.nombre}</option>`;
    });

    ['oro', 'plata', 'bronce1', 'bronce2'].forEach(medalla => {
        document.getElementById(`select-${medalla}`).innerHTML = opcionesHTML;
    });

    // Mostrar modal
    document.getElementById('modal-juez').style.display = 'flex';
}

function cerrarModalJuez() {
    document.getElementById('modal-juez').style.display = 'none';
    graficaActivaParaJuez = null;
}

async function guardarResultados() {
    const btn = event.target;
    btn.innerText = "Guardando...";
    btn.disabled = true;

    const resultados = {
        oro: document.getElementById('select-oro').value,
        plata: document.getElementById('select-plata').value,
        bronce1: document.getElementById('select-bronce1').value,
        bronce2: document.getElementById('select-bronce2').value
    };

    try {
        const respuesta = await API.registrarResultado(graficaActivaParaJuez, resultados);
        if(respuesta && respuesta.ok) {
            alert("¡Resultados guardados correctamente! Los puntos se han actualizado.");
            cerrarModalJuez();
            // Opcional: Recargar la vista principal para actualizar el estado a FINALIZADA
        } else {
            alert("Hubo un error al guardar los resultados.");
        }
    } catch(e) {
        alert("Error de conexión al guardar.");
    } finally {
        btn.innerText = "Guardar Ganadores";
        btn.disabled = false;
    }
}

// ==========================================
// MÓDULO DE RANKING (PUNTUACIONES)
// ==========================================

async function mostrarRanking() {
    // Ocultar el dashboard principal y mostrar el ranking
    document.getElementById('dashboard-principal').style.display = 'none'; // Asegúrate de que el id de tu dashboard principal sea este o ajústalo
    document.getElementById('vista-ranking').style.display = 'block';
    
    const tbody = document.getElementById('tabla-ranking-body');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Cargando tabla de posiciones... 🏆</td></tr>`;

    const datosRanking = await API.getRanking();
    
    if(!datosRanking || datosRanking.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Aún no hay puntos registrados. ¡Que comiencen los combates!</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    datosRanking.forEach((escuela, index) => {
        let medallaPosicion = index + 1;
        if(index === 0) medallaPosicion = "🥇 1";
        if(index === 1) medallaPosicion = "🥈 2";
        if(index === 2) medallaPosicion = "🥉 3";

        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px; font-weight: bold; font-size: 18px;">${medallaPosicion}</td>
                <td style="padding: 15px; font-weight: bold;">${escuela.escuela}</td>
                <td style="padding: 15px; text-align: center; color: #d4af37; font-weight: bold;">${escuela.oros || 0}</td>
                <td style="padding: 15px; text-align: center; color: #95a5a6; font-weight: bold;">${escuela.platas || 0}</td>
                <td style="padding: 15px; text-align: center; color: #cd7f32; font-weight: bold;">${escuela.bronces || 0}</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; color: #e67e22; font-size: 18px;">${escuela.puntos_totales} pts</td>
            </tr>
        `;
    });
}

function cerrarRanking() {
    document.getElementById('vista-ranking').style.display = 'none';
    document.getElementById('dashboard-principal').style.display = 'block'; // Vuelve a mostrar tu vista normal
}