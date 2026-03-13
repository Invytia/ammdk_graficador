let graficaActivaParaJuez = null;

function abrirModalJuez(idGrafica) {
    if(!window.datosGlobalesGraficas) return alert("Aún no cargan los datos. Espera un segundo.");
    
    const grafica = window.datosGlobalesGraficas.find(g => String(g.id) === String(idGrafica));
    if(!grafica) return alert("Error al cargar la gráfica");

    graficaActivaParaJuez = grafica.id;
    document.getElementById('juez-grafica-info').innerText = `Categoría: ${grafica.categoria} | Cinta: ${grafica.cinta}`;

    let opcionesHTML = `<option value="">-- Selecciona un competidor --</option>`;
    
    let listaC = grafica.competidores_data || grafica.competidores;
    if(listaC && listaC.length > 0) {
        listaC.forEach(comp => {
            const elId = comp.id || comp;
            const elNom = comp.nombre || comp;
            opcionesHTML += `<option value="${elId}">${elNom}</option>`;
        });
    }

    ['oro', 'plata', 'bronce1', 'bronce2'].forEach(medalla => {
        document.getElementById(`select-${medalla}`).innerHTML = opcionesHTML;
    });

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
        // CORRECCIÓN AQUÍ: Solo "API" en lugar de "window.API"
        const respuesta = await API.registrarResultado(graficaActivaParaJuez, resultados);
        if(respuesta && respuesta.ok) {
            alert("¡Resultados guardados! Puntuación actualizada.");
            cerrarModalJuez();
            if(typeof Graficas !== 'undefined') Graficas.render(document.getElementById('main-content'));
        } else {
            alert("Error al guardar: " + (respuesta.error || "Desconocido"));
        }
    } catch(e) {
        alert("Error de red. Intenta de nuevo.");
    } finally {
        btn.innerText = "Guardar y Actualizar Puntos";
        btn.disabled = false;
    }
}

async function mostrarRanking(event) {
    // Apaga los otros botones del menú y enciende este
    if(event) {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
    }

    document.getElementById('vista-ranking').style.display = 'block';
    
    const tbody = document.getElementById('tabla-ranking-body');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Cargando tabla de posiciones... 🏆</td></tr>`;

    try {
        // CORRECCIÓN AQUÍ: Solo "API" en lugar de "window.API"
        const datosRanking = await API.getRanking();
        
        if(!datosRanking || datosRanking.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:#666;">Aún no hay puntos registrados. ¡Que comiencen los combates!</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        datosRanking.forEach((escuela, index) => {
            let medallaPosicion = `<strong style="font-size: 1.2rem;">${index + 1}</strong>`;
            if(index === 0) medallaPosicion = "<span style='font-size: 1.5rem;'>🥇</span>";
            if(index === 1) medallaPosicion = "<span style='font-size: 1.5rem;'>🥈</span>";
            if(index === 2) medallaPosicion = "<span style='font-size: 1.5rem;'>🥉</span>";

            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 15px; text-align:center;">${medallaPosicion}</td>
                    <td style="padding: 15px; font-weight: bold; color: var(--mdk-black);">${escuela.escuela}</td>
                    <td style="padding: 15px; text-align: center; color: #d4af37; font-weight: bold;">${escuela.oros || 0}</td>
                    <td style="padding: 15px; text-align: center; color: #95a5a6; font-weight: bold;">${escuela.platas || 0}</td>
                    <td style="padding: 15px; text-align: center; color: #cd7f32; font-weight: bold;">${escuela.bronces || 0}</td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; color: var(--mdk-green); font-size: 1.2rem;">${escuela.puntos_totales} pts</td>
                </tr>
            `;
        });
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:red;">Error al cargar el ranking.</td></tr>`;
    }
}

function cerrarRanking() {
    document.getElementById('vista-ranking').style.display = 'none';
    // Simula un clic en el "Resumen General" para regresar tu pantalla a la normalidad
    document.querySelector('.nav-item').click(); 
}
