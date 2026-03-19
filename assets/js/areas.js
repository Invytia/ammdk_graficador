const Areas = {
    render: function(container) {
        // BLINDAJE EXTREMO: Si Google no manda una lista perfecta, forzamos una lista vacía para evitar el error .forEach
        const rawData = App.data.areas;
        const areasData = Array.isArray(rawData) ? rawData : [];
        
        let html = `
            <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="color: #666; font-family:'Montserrat';">Distribución de Tatamis</h3>
                <div style="display: flex; gap: 15px; font-size: 0.8rem; font-weight: bold; background: white; padding: 10px 20px; border-radius: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <span style="color: var(--status-ok)">🟢 Flujo Óptimo</span>
                    <span style="color: var(--status-warn)">🟡 Carga Media</span>
                    <span style="color: var(--status-danger)">🔴 Saturación</span>
                </div>
            </div>
            <div class="arena-layout">
        `;

        // Mensaje elegante si la lista está vacía
        if (areasData.length === 0) {
            html += `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #999; background: white; border-radius: 8px;">Aún no se han generado áreas de competencia o la hoja en Excel está vacía.</div>`;
        } else {
            areasData.forEach(area => {
                const statusColor = area.saturacion || 'verde'; 
                
                html += `
                    <div class="tatami status-${statusColor}" onclick="Areas.detalle('${area.id}')">
                        <h4>Área ${area.id}</h4>
                        <div class="sbn">${area.sbn || 'Sin Asignar'}</div>
                        <div class="stats">${area.graficasAsignadas || 0} Gráficas</div>
                        <small style="margin-top:5px; color:#888;">${area.horarioBase || '--:--'}</small>
                    </div>
                `;
            });
        }

        html += `</div>`;
        container.innerHTML = html;
    },

    detalle: function(idArea) {
        // Validaciones seguras para el panel lateral
        const safeAreas = Array.isArray(App.data.areas) ? App.data.areas : [];
        const safeGraficas = Array.isArray(App.data.graficas) ? App.data.graficas : [];

        const area = safeAreas.find(a => String(a.id) === String(idArea));
        const graficasArea = safeGraficas.filter(g => String(g.area) === String(idArea));
        
        if (!area) return;

        let drawerHtml = `
            <h2 style="color:var(--mdk-green); font-family:'Montserrat'; text-transform:uppercase;">Área ${area.id}</h2>
            <p style="color:#666; margin-bottom: 20px;">${area.sbn || 'Sin Asignar'}</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid var(--mdk-yellow); margin-bottom: 20px;">
                <p><strong>Carga actual:</strong> ${area.graficasAsignadas || 0} gráficas en cola.</p>
            </div>

            <h4 style="margin-bottom: 10px; font-family:'Montserrat'; border-bottom: 1px solid #ddd; padding-bottom:5px;">Combates Asignados</h4>
            <div>
        `;

        if (graficasArea.length === 0) {
            drawerHtml += `<p style="color:#999; font-style:italic; padding: 20px 0;">No hay combates en cola para esta área.</p>`;
        } else {
            graficasArea.forEach(g => {
                const hasAlert = g.alerta && g.alerta !== "";
                const borderColor = hasAlert ? 'var(--status-danger)' : 'var(--mdk-green)';
                const competidores = g.competidores ? g.competidores.join(' vs ') : 'Sin competidores';

                drawerHtml += `
                    <div style="padding: 15px; background: white; border: 1px solid #eee; border-left: 5px solid ${borderColor}; margin-bottom: 10px; border-radius: 4px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                            <strong style="color: var(--mdk-green);">${g.id}</strong>
                            <span style="font-size:0.8rem; background: #eee; padding: 2px 8px; border-radius: 10px;">${g.categoria || ''} - ${g.cinta || ''}</span>
                        </div>
                        <p style="font-size:0.9rem; font-weight:600; color: #333;">${competidores}</p>
                        ${hasAlert ? `<p style="color:var(--status-danger); font-size:0.8rem; margin-top:8px; font-weight:bold;">⚠️ ${g.alerta}</p>` : ''}
                    </div>
                `;
            });
        }

        drawerHtml += `</div>`;
        
        if (typeof Drawer !== 'undefined') {
            Drawer.open(drawerHtml);
        }
    }
};
