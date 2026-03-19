const Graficas = {
    // Memoria del filtro actual
    filtroActual: 'TODOS', // Puede ser 'TODOS', 'POOMSAE' o 'KYORUGUI'

    // Función que se activa al presionar los botones
    setFiltro: function(filtro) {
        this.filtroActual = filtro;
        const container = document.getElementById('main-content');
        if(container) this.render(container);
    },

    render: function(container) {
        const rawGraficas = App.data.graficas;
        const graficas = Array.isArray(rawGraficas) ? rawGraficas : [];
        
        // CRÍTICO: Guardamos en global para que el modal de Jueces sepa quién pelea
        window.datosGlobalesGraficas = graficas; 

        // Filtrar las gráficas antes de dibujarlas
        const graficasFiltradas = graficas.filter(g => {
            if (this.filtroActual === 'TODOS') return true;
            const esFormas = String(g.modalidad).toUpperCase().includes('FORMA');
            if (this.filtroActual === 'POOMSAE') return esFormas;
            if (this.filtroActual === 'KYORUGUI') return !esFormas;
            return true;
        });
        
        // Estilos para los botones
        const btnStyle = "padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-right: 10px; font-family: 'Montserrat', sans-serif; transition: all 0.2s;";
        const btnActivo = "background-color: var(--mdk-green); color: var(--mdk-yellow); box-shadow: 0 4px 6px rgba(0,0,0,0.2); transform: translateY(-2px);";
        const btnInactivo = "background-color: #ddd; color: #666;";

        const styleTodos = this.filtroActual === 'TODOS' ? btnActivo : btnInactivo;
        const stylePoomsae = this.filtroActual === 'POOMSAE' ? btnActivo : btnInactivo;
        const styleKyorugui = this.filtroActual === 'KYORUGUI' ? btnActivo : btnInactivo;

        let html = `
            <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="color: var(--mdk-green); font-family: 'Montserrat';">Listado General de Gráficas</h2>
                    <p style="color: #666;">Mostrando: <strong style="color: var(--mdk-green);">${graficasFiltradas.length}</strong> de ${graficas.length} totales</p>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button style="${btnStyle} ${styleTodos}" onclick="Graficas.setFiltro('TODOS')">📋 Todos</button>
                    <button style="${btnStyle} ${stylePoomsae}" onclick="Graficas.setFiltro('POOMSAE')">🥋 Poomsae (Formas)</button>
                    <button style="${btnStyle} ${styleKyorugui}" onclick="Graficas.setFiltro('KYORUGUI')">🥊 Kyorugui (Combate)</button>
                </div>
            </div>

            <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Categoría y Nivel</th>
                            <th>Ubicación</th>
                            <th>Competidores</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (graficasFiltradas.length === 0) {
            html += `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #999; font-style: italic; font-size: 1.1rem;">No hay gráficas en esta modalidad.</td></tr>`;
        } else {
            graficasFiltradas.forEach(g => {
                const hasAlert = g.alerta && g.alerta !== "";
                const rowStyle = hasAlert ? 'background-color: #fff5f5;' : '';
                
                // BLINDAJE: Aseguramos que el ID se trate como String
                const idSeguro = String(g.id || 'SIN_ID');
                
                // Formateo de nombres
                let competidoresNombres = [];
                if (g.competidores_data) {
                    competidoresNombres = g.competidores_data.map(c => c.nombre);
                } else if (g.competidores) {
                    competidoresNombres = g.competidores;
                }
                const competidoresTexto = competidoresNombres.length > 0 
                    ? competidoresNombres.join(' <strong style="color:var(--mdk-green);">vs</strong> ') 
                    : 'Sin asignar';
                
                // Diseño dinámico de la etiqueta de Estado
                const isFinalizada = String(g.estado).toUpperCase() === 'FINALIZADA';
                const badgeEstado = isFinalizada 
                    ? `<span style="background: var(--status-ok); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">✅ FINALIZADA</span>`
                    : `<span style="background: var(--status-warn); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">⏳ PENDIENTE</span>`;
                
                // Lógica de Modalidad: POOMSAE vs KYORUGUI
                const esFormas = String(g.modalidad).toUpperCase().includes('FORMA');
                const textoModalidad = esFormas ? 'POOMSAE' : 'KYORUGUI';
                const colorModalidad = esFormas ? '#2980b9' : '#c0392b'; // Azul para Poomsae, Rojo para Kyorugui
                const badgeModalidad = `<span style="background: ${colorModalidad}; color: white; padding: 3px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: bold; display: inline-block; margin-top: 6px; letter-spacing: 0.5px;">${textoModalidad}</span>`;

                html += `
                    <tr style="${rowStyle}">
                        <td><strong style="color: var(--mdk-green);">${idSeguro.substring(0,8)}...</strong></td>
                        <td>
                            ${g.categoria || '--'} <br>
                            <small style="color:#666">${g.cinta || ''}</small><br>
                            ${badgeModalidad}
                        </td>
                        <td>
                            <span style="background: var(--mdk-green); color: var(--mdk-yellow); padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 0.75rem;">
                                Área ${g.area || '?'}
                            </span>
                        </td>
                        <td>
                            <span style="font-weight: 600; color: #333;">${competidoresTexto}</span>
                            ${hasAlert ? `<br><small style="color: var(--status-danger); font-weight: bold; display:inline-block; margin-top:4px;">⚠️ ${g.alerta}</small>` : ''}
                        </td>
                        <td>${badgeEstado}</td>
                        <td>
                            <button onclick="abrirModalJuez('${idSeguro}')" style="background-color: var(--mdk-green); color: var(--mdk-yellow); border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.75rem; text-transform: uppercase; transition: all 0.2s ease;">
                                🎖️ Juez
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    }
};
