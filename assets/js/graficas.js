const Graficas = {
    render: function(container) {
        const graficas = App.data.graficas || [];
        
        // CRÍTICO: Guardamos en global para que el modal de Jueces sepa quién pelea
        window.datosGlobalesGraficas = graficas; 
        
        let html = `
            <div style="margin-bottom: 20px;">
                <h2 style="color: var(--mdk-green); font-family: 'Montserrat';">Listado General de Gráficas</h2>
                <p style="color: #666;">Total de combates/formas programados: <strong>${graficas.length}</strong></p>
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
        
        if (graficas.length === 0) {
            html += `<tr><td colspan="6" style="text-align:center; padding: 30px; color: #999; font-style: italic;">No hay gráficas generadas en el sistema.</td></tr>`;
        } else {
            graficas.forEach(g => {
                const hasAlert = g.alerta && g.alerta !== "";
                const rowStyle = hasAlert ? 'background-color: #fff5f5;' : '';
                
                // Formateo de nombres asegurando compatibilidad con la nueva API
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
                        <td><strong style="color: var(--mdk-green);">${g.id.substring(0,8)}...</strong></td>
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
                            <button onclick="abrirModalJuez('${g.id}')" style="background-color: var(--mdk-green); color: var(--mdk-yellow); border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.75rem; text-transform: uppercase; transition: all 0.2s ease;">
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
