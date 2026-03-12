const Alumnos = {
    buscar: function(query) {
        if (!query || query.trim() === "") {
            // Cierra el panel lateral si borras el texto de búsqueda
            if(document.getElementById('drawer').classList.contains('open')) {
                Drawer.close();
            }
            return;
        }

        const searchLower = query.toLowerCase();
        const graficas = App.data.graficas || [];
        
        // Filtra las gráficas donde alguno de los competidores coincida con la búsqueda
        const resultados = graficas.filter(g => {
            if (!g.competidores) return false;
            return g.competidores.some(c => c.toLowerCase().includes(searchLower));
        });

        let drawerHtml = `
            <h2 style="color:var(--mdk-green); font-family:'Montserrat'; text-transform:uppercase;">Resultados de Búsqueda</h2>
            <p style="color:#666; margin-bottom: 25px;">Buscando alumno: "<strong>${query}</strong>"</p>
        `;

        if (resultados.length === 0) {
            drawerHtml += `
                <div style="padding: 20px; text-align: center; background: #f9f9f9; border-radius: 8px; border: 1px dashed #ccc;">
                    <p style="color: #888;">No se encontró ningún alumno con ese nombre en las gráficas actuales.</p>
                </div>
            `;
        } else {
            drawerHtml += `<div style="display: flex; flex-direction: column; gap: 15px;">`;
            
            resultados.forEach(g => {
                // Resalta en verde el nombre del alumno encontrado
                const competidoresResaltados = g.competidores.map(c => 
                    c.toLowerCase().includes(searchLower) 
                    ? `<span style="background: #e8f5e9; color: var(--mdk-green); padding: 2px 6px; border-radius: 4px; border: 1px solid #c8e6c9;">${c}</span>` 
                    : c
                ).join(' <span style="color:#ccc; font-weight:normal;">vs</span> ');

                drawerHtml += `
                    <div style="background: white; border: 1px solid #ddd; border-top: 4px solid var(--mdk-green); padding: 20px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span style="background: var(--mdk-yellow); color: var(--mdk-green); padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 0.85rem;">
                                Área ${g.area}
                            </span>
                            <strong style="color: #666; font-size: 0.9rem;">ID: ${g.id}</strong>
                        </div>
                        <p style="font-size: 0.85rem; color: #888; margin-bottom: 8px; text-transform: uppercase;">
                            ${g.categoria || ''} • ${g.cinta || ''}
                        </p>
                        <p style="font-weight: bold; color: #333; line-height: 1.6; font-size: 1.05rem;">
                            ${competidoresResaltados}
                        </p>
                    </div>
                `;
            });
            drawerHtml += `</div>`;
        }

        // Abre el panel con los resultados
        if (typeof Drawer !== 'undefined') {
            Drawer.open(drawerHtml);
        }
    }
};