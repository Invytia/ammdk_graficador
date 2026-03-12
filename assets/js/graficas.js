const Graficas = {
    render: function(container) {
        const graficas = App.data.graficas || [];
        
        let html = `
            <div style="margin-bottom: 20px;">
                <h2 style="color: var(--mdk-green); font-family: 'Montserrat';">Listado General de Gráficas</h2>
                <p style="color: #666;">Total de combates programados: <strong>${graficas.length}</strong></p>
            </div>
            <div style="overflow-x: auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Categoría y Nivel</th>
                            <th>Ubicación</th>
                            <th>Competidores</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (graficas.length === 0) {
            html += `<tr><td colspan="4" style="text-align:center; padding: 30px; color: #999; font-style: italic;">No hay gráficas generadas en el sistema.</td></tr>`;
        } else {
            graficas.forEach(g => {
                const hasAlert = g.alerta && g.alerta !== "";
                const rowStyle = hasAlert ? 'background-color: #fff5f5;' : '';
                const competidores = g.competidores ? g.competidores.join(' vs ') : 'Sin asignar';
                
                html += `
                    <tr style="${rowStyle}">
                        <td><strong style="color: var(--mdk-green);">${g.id}</strong></td>
                        <td>${g.categoria || '--'} <br><small style="color:#666">${g.cinta || ''}</small></td>
                        <td>
                            <span style="background: var(--mdk-green); color: var(--mdk-yellow); padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 0.75rem;">
                                Área ${g.area || '?'}
                            </span>
                        </td>
                        <td>
                            <span style="font-weight: 600; color: #333;">${competidores}</span>
                            ${hasAlert ? `<br><small style="color: var(--status-danger); font-weight: bold; display:inline-block; margin-top:4px;">⚠️ ${g.alerta}</small>` : ''}
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    }
};