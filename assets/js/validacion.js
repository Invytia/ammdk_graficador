const Validacion = {
    render: function(container) {
        const alertas = App.data.alertas || [];
        
        let html = `
            <div style="margin-bottom: 20px;">
                <h2 style="color: var(--mdk-green); font-family: 'Montserrat';">Conflictos y Alertas</h2>
                <p style="color: #666;">Se encontraron <strong>${alertas.length}</strong> incidencias que requieren revisión operativa.</p>
            </div>
        `;

        if (alertas.length === 0) {
            html += `
                <div style="background: #e8f5e9; padding: 25px; border-left: 5px solid var(--status-ok); border-radius: 4px; color: var(--mdk-green);">
                    <strong style="font-size: 1.1rem;">¡Todo en orden!</strong><br>
                    No se detectaron alumnos duplicados ni errores de categorización en las gráficas actuales.
                </div>
            `;
        } else {
            html += `<div style="display: flex; flex-direction: column; gap: 15px;">`;
            alertas.forEach(alerta => {
                const isHighSeverity = alerta.severidad === 'alta' || alerta.tipo === 'Error';
                const borderColor = isHighSeverity ? 'var(--status-danger)' : 'var(--status-warn)';
                const icon = isHighSeverity ? '🔴' : '🟡';
                const textColor = isHighSeverity ? '#c0392b' : '#b9770e';
                
                html += `
                    <div class="alert-card" style="border-left-color: ${borderColor};">
                        <strong style="display: block; margin-bottom: 8px; font-size: 1.05rem; color: ${textColor};">
                            ${icon} ${alerta.tipo || 'Alerta de Sistema'}
                        </strong>
                        <span style="color: #444; font-size: 0.95rem;">${alerta.msg}</span>
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        container.innerHTML = html;
    }
};