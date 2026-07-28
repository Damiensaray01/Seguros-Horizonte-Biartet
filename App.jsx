import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [metrics, setMetrics] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [agentRanking, setAgentRanking] = useState([]);
  const [dailyConsolidated, setDailyConsolidated] = useState([]);
  const [salesByListChart, setSalesByListChart] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'Administrador' && password === 'ADM2026') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setMetrics(data.metrics);
      setTableData(data.data || []);
      setAgentRanking(data.agentRanking || []);
      setDailyConsolidated(data.dailyConsolidated || []);
      setSalesByListChart(data.salesByListChart || []);
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular las horas transcurridas desde las 9:00 hasta la hora actual (tope 17:00)
  const calculateElapsedHours = () => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    
    const startHour = 9.0; // 9:00 AM
    const endHour = 17.0;   // 5:00 PM (17:00)

    if (currentHour <= startHour) return 1.0; 
    if (currentHour >= endHour) return endHour - startHour; 

    return currentHour - startHour;
  };

  // Función para descargar los datos directamente desde el Google Sheets en formato Excel
  const descargarPlantillaAviacionYAcademia = () => {
    try {
      const sheetId = "1PcmRLaA3jh0JoZWbiZtAtw_7wLj4IYFyxDHoCoTzZQA";
      const gid = "1205148090";
      // Enlace directo de exportación para iniciar la descarga inmediata en el navegador
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx&gid=${gid}`;

      window.open(exportUrl, '_blank');
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      alert('No se pudo iniciar la descarga.');
    }
  };

  // Pantalla de Login Corporativa con logos grandes
  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        width: '100%', 
        margin: 0, 
        padding: 0, 
        fontFamily: 'Arial, sans-serif', 
        overflowX: 'hidden', 
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0
      }}>
        
        {/* Lado izquierdo: Edificio transparente */}
        <div style={{ 
          flex: 1, 
          height: '100%',
          backgroundImage: `linear-gradient(rgba(0, 51, 102, 0.15), rgba(0, 51, 102, 0.35)), url('/edificio.jpg')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '40px',
          color: '#ffffff',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>Seguros Horizonte</h1>
          <p style={{ fontSize: '16px', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>Call Center Dashboard & Gestión de Rendimiento</p>
        </div>

        {/* Lado derecho: Formulario */}
        <div style={{ width: '460px', height: '100%', background: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px', boxSizing: 'border-box', boxShadow: '-4px 0 15px rgba(0,0,0,0.05)', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ width: '100%' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <img src="/logo.png" alt="Seguros Horizonte Logo 1" style={{ width: '180px', height: 'auto', objectFit: 'contain' }} />
                <img src="/logo2.png" alt="Seguros Horizonte Logo 2" style={{ width: '180px', height: 'auto', objectFit: 'contain' }} />
              </div>
              <h2 style={{ color: '#003366', margin: 0, fontSize: '18px' }}>Iniciar Sesión</h2>
            </div>
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#003366', fontSize: '13px', fontWeight: 'bold' }}>Usuario</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Ej. Administrador"
                  style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }}
                  required 
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#003366', fontSize: '13px', fontWeight: 'bold' }}>Contraseña</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }}
                  required 
                />
              </div>

              {loginError && <p style={{ color: '#dc3545', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>{loginError}</p>}

              <button 
                type="submit" 
                style={{ width: '100%', padding: '12px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
              >
                Ingresar al Sistema
              </button>
            </form>
          </div>
        </div>

      </div>
    );
  }

  // Dashboard Principal
  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', background: '#f0f4f8', minHeight: '100vh', boxSizing: 'border-box', width: '100%', margin: 0 }}>
      <div style={{ background: '#ffffff', padding: '20px 25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 86, 179, 0.05)', marginBottom: '25px', borderLeft: '5px solid #0056b3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <img src="/logo2.png" alt="Seguros Horizonte Logo" style={{ width: '180px', height: 'auto', objectFit: 'contain' }} />
          <div>
            <h2 style={{ color: '#003366', margin: '0 0 5px 0' }}>Seguros Horizonte Call Center Dashboard</h2>
            <p style={{ color: '#555', margin: 0, fontSize: '14px' }}>Importa tu archivo TXT para visualizar el rendimiento, gráficos por base de datos y rankings.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={descargarPlantillaAviacionYAcademia} 
            style={{ padding: '8px 14px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            Descargar Aviación y Academia (Excel)
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)} 
            style={{ padding: '8px 14px', background: '#eef2f7', color: '#003366', border: '1px solid #d0e1fd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #d0e1fd' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#003366' }}>
          Seleccionar archivo TXT de llamadas:
        </label>
        <input type="file" accept=".txt" onChange={handleFileUpload} />
        {loading && <p style={{ color: '#0056b3', marginTop: '10px', fontWeight: 'bold' }}>Procesando archivo...</p>}
      </div>

      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #0056b3', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span style={{ color: '#666', fontSize: '13px' }}>Total Llamadas</span>
            <h2 style={{ margin: '5px 0 0', color: '#003366' }}>{metrics.totalCalls}</h2>
          </div>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #17a2b8', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span style={{ color: '#666', fontSize: '13px' }}>Contactos Efectivos</span>
            <h2 style={{ margin: '5px 0 0', color: '#003366' }}>{metrics.effectiveContacts}</h2>
          </div>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #28a745', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span style={{ color: '#666', fontSize: '13px' }}>Ventas</span>
            <h2 style={{ margin: '5px 0 0', color: '#003366' }}>{metrics.sales}</h2>
          </div>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #6f42c1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span style={{ color: '#666', fontSize: '13px' }}>Conversión</span>
            <h2 style={{ margin: '5px 0 0', color: '#003366' }}>{metrics.conversionRate}</h2>
          </div>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #dc3545', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <span style={{ color: '#666', fontSize: '13px' }}>SPH (Ventas/Hora)</span>
            <h2 style={{ margin: '5px 0 0', color: '#003366' }}>{metrics.sph}</h2>
          </div>
        </div>
      )}

      {salesByListChart.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', marginBottom: '30px', padding: '20px', border: '1px solid #d0e1fd' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#003366' }}>Ventas por Base de Datos (List Description)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={salesByListChart} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1ecf8" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 12, fill: '#333' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#333' }} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#0056b3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {agentRanking.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', marginBottom: '30px', overflow: 'hidden', border: '1px solid #d0e1fd' }}>
          <div style={{ padding: '18px 20px', background: '#eef2f7', borderBottom: '1px solid #d0e1fd' }}>
            <h3 style={{ margin: '0', color: '#003366' }}>Ranking por Asesor</h3>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ background: '#f8fbff', position: 'sticky', top: '0' }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Asesor</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Total Llamadas</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Efectivos</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Ventas</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Meta (Ventas)</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Efectividad de Ventas</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>% Efectividad (Efectivos / Total)</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>SPH (Ventas / Horas)</th>
                </tr>
              </thead>
              <tbody>
                {agentRanking.map((item, index) => {
                  const meta = 5;
                  const ventas = Number(item.sales) || 0;
                  const efectivos = Number(item.efectivo) || 0;
                  const totalLlamadas = Number(item.totalCalls) || 0;

                  const elapsedHours = calculateElapsedHours();
                  const sphAgent = (ventas / elapsedHours).toFixed(2);

                  const efectividadVentas = Math.min(Math.round((ventas / meta) * 100), 100);
                  const efectividadLlamadas = totalLlamadas > 0 ? ((efectivos / totalLlamadas) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f4f8' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#333' }}>{item.agent}</td>
                      <td style={{ padding: '12px', color: '#555' }}>{totalLlamadas}</td>
                      <td style={{ padding: '12px', color: '#555' }}>{efectivos}</td>
                      <td style={{ padding: '12px', color: '#28a745', fontWeight: 'bold' }}>{ventas}</td>
                      <td style={{ padding: '12px', color: '#0056b3', fontWeight: 'bold' }}>{meta}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          background: efectividadVentas >= 100 ? '#d4edda' : '#fff3cd', 
                          color: efectividadVentas >= 100 ? '#155724' : '#856404', 
                          fontWeight: 'bold', 
                          fontSize: '12px' 
                        }}>
                          {efectividadVentas}%
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#17a2b8', fontWeight: 'bold' }}>
                        {efectividadLlamadas}%
                      </td>
                      <td style={{ padding: '12px', color: '#dc3545', fontWeight: 'bold' }}>
                        {sphAgent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dailyConsolidated.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', marginBottom: '30px', overflow: 'hidden', border: '1px solid #d0e1fd' }}>
          <div style={{ padding: '18px 20px', background: '#eef2f7', borderBottom: '1px solid #d0e1fd' }}>
            <h3 style={{ margin: '0', color: '#003366' }}>Consolidado por Día</h3>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ background: '#f8fbff', position: 'sticky', top: '0' }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Fecha</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Total Llamadas</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Efectivos</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Ventas</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>% Efectividad de Contacto Efectivo</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Meta de Ventas </th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>% Efectividad de Ventas </th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>SPH </th>
                </tr>
              </thead>
              <tbody>
                {dailyConsolidated.map((item, index) => {
                  const totalLlamadas = Number(item.totalCalls) || 0;
                  const efectivos = Number(item.efectivo) || 0;
                  const ventas = Number(item.sales) || 0;

                  const efectividadContacto = totalLlamadas > 0 ? ((efectivos / totalLlamadas) * 100).toFixed(1) : '0.0';

                  const metaPorAsesor = 5;
                  const totalAsesores = agentRanking.length > 0 ? agentRanking.length : 1;
                  const sumaMetaVentas = totalAsesores * metaPorAsesor;

                  const efectividadVentasContacto = efectivos > 0 ? ((ventas / efectivos) * 100).toFixed(1) : '0.0';

                  const elapsedHours = calculateElapsedHours();
                  const sphDiario = (ventas / elapsedHours).toFixed(2);

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f4f8' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#333' }}>{item.date}</td>
                      <td style={{ padding: '12px', color: '#555' }}>{totalLlamadas}</td>
                      <td style={{ padding: '12px', color: '#555' }}>{efectivos}</td>
                      <td style={{ padding: '12px', color: '#28a745', fontWeight: 'bold' }}>{ventas}</td>
                      <td style={{ padding: '12px', color: '#17a2b8', fontWeight: 'bold' }}>{efectividadContacto}%</td>
                      <td style={{ padding: '12px', color: '#0056b3', fontWeight: 'bold' }}>{sumaMetaVentas}</td>
                      <td style={{ padding: '12px', color: '#0056b3', fontWeight: 'bold' }}>{efectividadVentasContacto}%</td>
                      <td style={{ padding: '12px', color: '#dc3545', fontWeight: 'bold' }}>{sphDiario}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tableData.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #d0e1fd' }}>
          <div style={{ padding: '18px 20px', background: '#eef2f7', borderBottom: '1px solid #d0e1fd' }}>
            <h3 style={{ margin: '0', color: '#003366' }}>Desglose de Ventas Registradas</h3>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ background: '#f8fbff', position: 'sticky', top: '0' }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Fecha</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Teléfono</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Status</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>List Description</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Agente (User)</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Nombre</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #d0e1fd', color: '#003366' }}>Campaña</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <td style={{ padding: '12px', color: '#555' }}>{row.call_date || row.fecha || '-'}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{row.phone_number || row.telefono || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#d4edda', color: '#155724', fontWeight: 'bold', fontSize: '12px' }}>
                        {row.status_name || row.status || 'ACEPTA VENTA'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#555' }}>{row.list_description || '-'}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{row.user || row.agente || '-'}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{row.full_name || row.nombre || '-'}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{row.campaign_id || row.campana || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;