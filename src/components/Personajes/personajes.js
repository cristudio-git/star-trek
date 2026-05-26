// src/components/personajes.js
import React, { useState, useEffect, useCallback } from 'react';
import './personajes.css'; // Estilos separados

function Personajes() {
  const [listaPersonajes, setListaPersonajes] = useState([]);
  const [fotosPersonajes, setFotosPersonajes] = useState({}); // Guardará { uid: 'url_de_la_foto' }
  const [cargando, setCargando] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Función para buscar la foto de un personaje individual en la API de Memory Alpha
  const obtenerFotoDeWiki = async (nombrePersonaje) => {
    try {
      // Reemplaza espacios por guiones bajos para el formato de títulos de la wiki
      const tituloPagina = encodeURIComponent(nombrePersonaje.trim().replace(/ /g, '_'));
      const urlApiWiki = `https://memory-alpha.fandom.com/api.php?action=query&titles=${tituloPagina}&prop=pageimages&format=json&pithumbsize=400&origin=*`;

      const respuesta = await fetch(urlApiWiki);
      const data = await respuesta.json();
      
      const paginas = data.query?.pages;
      if (!paginas) return null;

      const pageId = Object.keys(paginas)[0];
      
      // Si la página existe y tiene miniatura (thumbnail), devolvemos la URL
      if (pageId !== "-1" && paginas[pageId].thumbnail) {
        return paginas[pageId].thumbnail.source;
      }
      return null;
    } catch (error) {
      console.error(`Error buscando foto para ${nombrePersonaje}:`, error);
      return null;
    }
  };

  // Función principal de búsqueda de personajes (envuelta en useCallback para evitar renders infinitos)
  const buscarPersonajesEnAPI = useCallback((nombreABuscar, numeroPagina) => {
    setCargando(true);

    fetch(`https://stapi.co/api/v1/rest/character/search?pageSize=10&pageNumber=${numeroPagina}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'name': nombreABuscar 
      })
    })
      .then((response) => response.json())
      .then(async (data) => {
        const respuestaLimpia = Array.isArray(data) ? data[0] : data;
        const personajesSucios = respuestaLimpia.characters || [];

        // Filtramos duplicados por nombre
        const nombresVistos = new Set();
        const personajesUnicos = personajesSucios.filter(personaje => {
          const nombreNormalizado = personaje.name.toLowerCase().trim();
          if (nombresVistos.has(nombreNormalizado)) {
            return false;
          } else {
            nombresVistos.add(nombreNormalizado);
            return true;
          }
        });

        setListaPersonajes(personajesUnicos);
        
        if (respuestaLimpia.page) {
          setTotalPaginas(respuestaLimpia.page.totalPages);
        }

        // --- LÓGICA DE WEB SCRAPING / API WIKI ---
        // Buscamos las fotos de los 10 personajes en paralelo utilizando Promise.all
        const promesasFotos = personajesUnicos.map(async (personaje) => {
          const urlFoto = await obtenerFotoDeWiki(personaje.name);
          return { uid: personaje.uid, urlFoto };
        });

        const resultadosFotos = await Promise.all(promesasFotos);
        
        // Convertimos el array de resultados en un objeto indexado por el UID del personaje
        const mapaFotos = {};
        resultadosFotos.forEach(res => {
          if (res.urlFoto) {
            mapaFotos[res.uid] = res.urlFoto;
          }
        });

        // Combinamos las nuevas fotos con las que ya teníamos mapeadas
        setFotosPersonajes(prev => ({ ...prev, ...mapaFotos }));
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error en las comunicaciones de la Flota:", error);
        setCargando(false);
      });
  }, []);

  useEffect(() => {
    buscarPersonajesEnAPI(terminoBusqueda, paginaActual);
  }, [paginaActual, buscarPersonajesEnAPI]);

  const manejarSubmit = (e) => {
    e.preventDefault();
    setPaginaActual(0);
    buscarPersonajesEnAPI(terminoBusqueda, 0);
  };

  const paginaAnterior = () => {
    if (paginaActual > 0) setPaginaActual(paginaActual - 1);
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas - 1) setPaginaActual(paginaActual + 1);
  };

  const traducirGenero = (g) => {
    if (g === 'M') return 'Masculino';
    if (g === 'F') return 'Femenino';
    return 'Desconocido';
  };

  return (
    <main className="personajes-page">
      <h2>Registro de Tripulantes</h2>
      
      {/* Buscador */}
      <form onSubmit={manejarSubmit} className="buscador-form">
        <input 
          type="text" 
          placeholder="Ej: Kirk, Spock, Janeway..." 
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          className="buscador-input"
        />
        <button type="submit" className="buscador-btn">Buscar</button>
      </form>

      {/* Control de Carga */}
      {cargando ? (
        <p className="mensaje-estado">Sincronizando con Memory Alpha y Base de Datos...</p>
      ) : (
        <>
          {/* Grid de Tarjetas */}
          <div className="personajes-grid">
            {listaPersonajes.length > 0 ? (
              listaPersonajes.map((personaje) => {
                // Buscamos si este personaje tiene una foto descargada de la wiki
                const fotoUrl = fotosPersonajes[personaje.uid];

                return (
                  <div key={personaje.uid} className="personaje-card">
                    
                    {/* Contenedor de la Foto */}
                    <div className="personaje-foto-wrapper">
                      {fotoUrl ? (
                        <img 
                          src={fotoUrl} 
                          alt={personaje.name} 
                          className="personaje-foto" 
                        />
                      ) : (
                        <div className="personaje-foto-placeholder">
                          <span>🚀 No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Cuerpo de Datos */}
                    <div className="personaje-body">
                      <h3 className="personaje-nombre">{personaje.name}</h3>
                      
                      <div className="personaje-datos">
                        <p><strong>Género:</strong> {traducirGenero(personaje.gender)}</p>
                        <p><strong>Nacimiento:</strong> {personaje.yearOfBirth || 'Desconocido'}</p>
                        <p><strong>Estado:</strong> {personaje.deceased ? `Fallecido (${personaje.yearOfDeath || ''})` : 'Activo / N/C'}</p>
                      </div>
                      
                      {/* Etiquetas de Universo */}
                      <div className="tags-container">
                        {personaje.mirror && <span className="tag tag-espejo">🌌 Espejo</span>}
                        {personaje.alternateReality && <span className="tag tag-kelvin">🌀 Kelvin</span>}
                        {!personaje.mirror && !personaje.alternateReality && <span className="tag tag-principal">🚀 Principal</span>}
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <p className="mensaje-vacio">No se encontraron tripulantes.</p>
            )}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion-container">
              <button onClick={paginaAnterior} disabled={paginaActual === 0} className="paginacion-btn">
                Anterior
              </button>
              <span className="paginacion-info">
                Página {paginaActual + 1} de {totalPaginas}
              </span>
              <button onClick={paginaSiguiente} disabled={paginaActual === totalPaginas - 1} className="paginacion-btn">
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Personajes;