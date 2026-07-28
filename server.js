const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar multer para usar memoria RAM en lugar de guardar archivos en disco
const upload = multer({ storage: multer.memoryStorage() });

// Ruta principal para evitar el error "Cannot GET /"
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'API del sistema de Call Center funcionando correctamente en Vercel.',
        endpoint: '/api/upload'
    });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    try {
        // Leer el archivo directamente desde el buffer en memoria
        const fileContent = req.file.buffer.toString('utf8');
        const lines = fileContent.split(/\r?\n/);

        let headers = [];
        const rows = [];

        // Obtener la fecha actual del sistema (2026-07-27)
        const todayStr = new Date().toISOString().split('T')[0];

        // Listas permitidas solicitadas
        const allowedLists = ['6to banfanb medicina', 'plan de localizacion'];

        lines.forEach((line, index) => {
            if (!line.trim()) return;
            const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
            const cleanedParts = parts.map(p => p.trim());

            if (index === 0 || headers.length === 0) {
                headers = cleanedParts.map(h => h.toLowerCase().replace(/["']/g, ''));
            } else {
                let rowObj = {};
                cleanedParts.forEach((val, i) => {
                    const headerName = headers[i] || `col_${i}`;
                    rowObj[headerName] = val.replace(/["']/g, '');
                });

                // Asignar explícitamente el teléfono de la Columna 2 (índice 1) como phone_number_dialed
                if (cleanedParts.length > 1) {
                    rowObj.phone_number_dialed = cleanedParts[1].replace(/["']/g, '');
                }

                const callDate = rowObj.call_date || rowObj.fecha || '';
                const dayKey = callDate ? callDate.split(' ')[0] : '';
                const listDesc = (rowObj.list_description || rowObj.list_desc || '').toLowerCase().trim();

                // FILTRO 1: Validar estrictamente que sea del DÍA DE HOY
                if (dayKey !== todayStr) return;

                // FILTRO 2: Validar que pertenezca a las listas permitidas
                if (!allowedLists.includes(listDesc)) return;

                rows.push(rowObj);
            }
        });

        const efectivoStatuses = [
            "ACEPTA VENTA",
            "AGENDADO",
            "COMPROMISO DE PAGO",
            "NO LE INTERESA",
            "NO TIENE DINERO",
            "YA CONTRATO"
        ];

        let totalCalls = rows.length;
        let salesCount = 0;
        let efectivoCount = 0;
        const salesRows = [];

        const agentsMap = {};
        const dailyMap = {};
        const listDescriptionMap = {}; 

        rows.forEach(row => {
            const statusName = (row.status_name || row.status || '').toUpperCase();
            const callDate = row.call_date || row.fecha || '';
            const dayKey = callDate ? callDate.split(' ')[0] : 'Desconocido';
            const agentName = row.full_name || row.nombre || row.user || 'Sin Asesor';
            const listDesc = row.list_description || 'Sin Descripción';

            // 1. Consolidado Diario
            if (!dailyMap[dayKey]) {
                dailyMap[dayKey] = { date: dayKey, totalCalls: 0, efectivo: 0, sales: 0 };
            }
            dailyMap[dayKey].totalCalls++;

            // 2. Ranking por Asesor
            if (!agentsMap[agentName]) {
                agentsMap[agentName] = { agent: agentName, totalCalls: 0, efectivo: 0, sales: 0 };
            }
            agentsMap[agentName].totalCalls++;

            if (efectivoStatuses.includes(statusName)) {
                efectivoCount++;
                dailyMap[dayKey].efectivo++;
                agentsMap[agentName].efectivo++;
            }

            if (statusName === "ACEPTA VENTA") {
                salesCount++;
                salesRows.push(row);
                dailyMap[dayKey].sales++;
                agentsMap[agentName].sales++;

                // 3. Agrupar ventas por list_description
                if (!listDescriptionMap[listDesc]) {
                    listDescriptionMap[listDesc] = 0;
                }
                listDescriptionMap[listDesc]++;
            }
        });

        const agentRanking = Object.values(agentsMap).sort((a, b) => b.sales - a.sales);
        const dailyConsolidated = Object.values(dailyMap).sort((a, b) => new Date(b.date) - new Date(b.date));
        
        const salesByListChart = Object.keys(listDescriptionMap).map(key => ({
            name: key,
            cantidad: listDescriptionMap[key]
        }));

        const conversionRate = totalCalls > 0 ? ((salesCount / totalCalls) * 100).toFixed(2) + '%' : '0%';
        const sph = totalCalls > 0 ? (salesCount / (totalCalls / 60)).toFixed(2) : '0';

        const metrics = {
            totalCalls: totalCalls,
            effectiveContacts: efectivoCount,
            sales: salesCount,
            conversionRate: conversionRate,
            sph: sph
        };

        res.json({
            metrics: metrics,
            data: salesRows,
            agentRanking: agentRanking,
            dailyConsolidated: dailyConsolidated,
            salesByListChart: salesByListChart
        });

    } catch (error) {
        console.error('Error procesando el archivo:', error);
        res.status(500).json({ error: 'Error interno al procesar el archivo TXT' });
    }
});

// IMPORTANTE: Exportar la app para que Vercel la ejecute como Serverless Function
module.exports = app;