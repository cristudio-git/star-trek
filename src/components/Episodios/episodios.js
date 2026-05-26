// src/components/episodios.js
import React, { useState, useEffect, useCallback } from 'react';
import './episodios.css';

function Episodios() {
  const [listaEpisodios, setListaEpisodios] = useState([]);
  const [sinopsisEpisodios, setSinopsisEpisodios] = useState({}); // Guardará { uid: 'Sinopsis en español...' }
  const [cargando, setCargando] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Función optimizada para extraer el resumen ("extract") desde la API de la Wiki en Español
  const obtenerSinopsisDeWiki = async (tituloEpisodio) => {
    try {
      // Limpiamos comillas que a veces envía STAPI (Ej: 'Phage' -> Phage)
      const tituloLimpio = tituloEpisodio.replace(/^'|'$/g, '').trim();
      const tituloURL = encodeURIComponent(tituloLimpio.replace(/ /g, '_'));
      
      // Consultamos la API de Fandom en Español (obsérvese el /es/)
      // Usamos prop=extracts, explaintext (texto plano sin HTML) y exchars=240 para limitar tamaño
      const urlApiWiki = `https://memory-alpha.fandom.com/es/api.php?action=query&titles=${tituloURL}&prop=extracts&exintro=1&explaintext=1&format=json&exchars=240&origin=*`;

      const respuesta = await fetch(urlApiWiki);
      const data = await respuesta.json();
      
      const paginas = data.query?.pages;
      if (!paginas) return null;

      const pageId = Object.keys(paginas)[0];
      
      // Si la página existe en español y tiene un extracto de texto, lo devolvemos
      if (pageId !== "-1" && paginas[pageId].extract) {
        return paginas[pageId].extract;
      }

      // Plan B: Si no existe en la wiki hispana, intentamos buscar el artículo en la wiki en Inglés
      const urlApiWikiEn = `https://memory-alpha.fandom.com/api.php?action=query&titles=${tituloURL}&prop=extracts&exintro=1&explaintext=1&format=json&exchars=240&origin=*`;
      const respuestaEn = await fetch(urlApiWikiEn);
      const dataEn = await respuestaEn.json();
      const paginasEn = dataEn.query?.pages;
      
      if (paginasEn) {
        const pageIdEn = Object.keys(paginasEn)[0];
        if (pageIdEn !== "-1" && paginasEn[pageIdEn].extract) {
          return paginasEn[pageIdEn].extract + " (Traducción no disponible)";
        }
      }

      return null;
    } catch (error) {
      console.error(`Error de conexión con la sub-red de la Wiki para: ${tituloEpisodio}`, error);
      return null;
    }
  };

  const buscarEpisodiosEnAPI = useCallback((textoBuscar, numeroPagina) => {
    setCargando(true);

    fetch(`https://stapi.co/api/v1/rest/episode/search?pageSize=10&pageNumber=${numeroPagina}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ 'title': textoBuscar })
    })
      .then((response) => response.json())
      .then(async (data) => {
        const respuestaLimpia = Array.isArray(data) ? data[0] : data;
        const episodiosObtenidos = respuestaLimpia.episodes || [];
        
        setListaEpisodios(episodiosObtenidos);
        
        if (respuestaLimpia.page) {
          setTotalPaginas(respuestaLimpia.page.totalPages);
        }

        // Ejecutamos las peticiones a la Wiki en paralelo para no ralentizar la interfaz
        const promesasSinopsis = episodiosObtenidos.map(async (episodio) => {
          const sinopsis = await obtenerSinopsisDeWiki(episodio.title);
          return { uid: episodio.uid, sinopsis };
        });

        const resultadosSinopsis = await Promise.all(promesasSinopsis);
        
        const mapaSinopsis = {};
        resultadosSinopsis.forEach(res => {
          if (res.sinopsis) {
            mapaSinopsis[res.uid] = res.sinopsis;
          }
        });

        setSinopsisEpisodios(prev => ({ ...prev, ...mapaSinopsis }));
        setCargando(false);
      })
      .catch((error) => {
        console.error("Fallo en los sensores de largo alcance (STAPI):", error);
        setCargando(false);
      });
  }, []);

  useEffect(() => {
    buscarEpisodiosEnAPI(terminoBusqueda, paginaActual);
  }, [paginaActual, buscarEpisodiosEnAPI]);

  const manejarSubmit = (e) => {
    e.preventDefault();
    setPaginaActual(0);
    buscarEpisodiosEnAPI(terminoBusqueda, 0);
  };

  return (
    <main className="episodios-page">
      <h2>Archivo Computarizado de Episodios</h2>
      
      <form onSubmit={manejarSubmit} className="buscador-form">
        <input 
          type="text" 
          placeholder="Buscar episodio por nombre en inglés (Ej: Phage, Caretaker, Emissary)..." 
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          className="buscador-input"
        />
        <button type="submit" className="buscador-btn">Escanear</button>
      </form>

      {cargando ? (
        <p className="mensaje-estado">Descifrando transmisiones de la Flota Estelar...</p>
      ) : (
        <>
          <div className="episodios-grid">
            {listaEpisodios.length > 0 ? (
              listaEpisodios.map((episodio) => {
                const sinopsis = sinopsisEpisodios[episodio.uid];

                return (
                  <div key={episodio.uid} className="episodio-card">
                    <div className="episodio-header-section">
                      <h3 className="episodio-titulo">{episodio.title}</h3>
                      <p className="episodio-serie">
                        {episodio.series ? episodio.series.title : 'Star Trek'}
                      </p>
                    </div>
                    
                    <div className="episodio-meta-datos">
                      <span><strong>T:</strong> {episodio.seasonNumber || 'N/C'}</span>
                      <span><strong>Ep:</strong> {episodio.episodeNumber || 'N/C'}</span>
                      <span><strong>Estreno:</strong> {episodio.usAirDate || 'Desconocido'}</span>
                    </div>

                    {/* Contenedor de la Sinopsis inyectada de la Wiki */}
                    <div className="episodio-descripcion-box">
                      {sinopsis ? (
                        <p className="episodio-extracto">{sinopsis}</p>
                      ) : (
                        <p className="episodio-extracto-placeholder">
                          Cargando bitácora u orden de protección no disponible.
                        </p>
                      )}
                    </div>
                    
                    <div className="episodio-footer">
                      <span>ID Prod: #{episodio.productionSerialNumber || 'Desconocido'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="mensaje-vacio">No se encontraron registros en los bancos de datos.</p>
            )}
          </div>

          {totalPaginas > 1 && (
            <div className="paginacion-container">
              <button onClick={() => setPaginaActual(p => Math.max(0, p - 1))} disabled={paginaActual === 0} className="paginacion-btn">
                Anterior
              </button>
              <span className="paginacion-info">Banda {paginaActual + 1} de {totalPaginas}</span>
              <button onClick={() => setPaginaActual(p => Math.min(totalPaginas - 1, p + 1))} disabled={paginaActual === totalPaginas - 1} className="paginacion-btn">
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Episodios;