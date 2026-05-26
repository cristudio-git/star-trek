import React, { useState } from 'react';
import listaDeCitas from '../../data/citas.json';
import './citas.css';

function Citas() {
  
  // Función para elegir una posición al azar
  const obtenerCitaAleatoria = () => {
    const indiceAleatorio = Math.floor(Math.random() * listaDeCitas.length);
    return listaDeCitas[indiceAleatorio];
  };

  // Inicializamos el estado con una cita al azar
  const [citaActual, setCitaActual] = useState(obtenerCitaAleatoria);

  // Función para cambiar la frase al hacer clic
  const cambiarCita = () => {
    setCitaActual(obtenerCitaAleatoria());
  };

  return (
    <main className="citas-page">
      <h2>Frase Célebre</h2>
      
      <div className="citas-container">
        <blockquote className="cita-card">
          <p className="frase">"{citaActual.frase}"</p>
          <footer className="autor">
            — {citaActual.autor}, <cite>{citaActual.episodio}</cite>
          </footer>
        </blockquote>
      </div>

      <button className="btn-siguiente" onClick={cambiarCita}>
        Siguiente Cita🖖
      </button>
    </main>
  );
}

export default Citas;