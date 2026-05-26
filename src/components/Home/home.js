import STUniverse from '../../assets/startrekuniverse.png';
import './home.css';

function Home() {
    return (
      <>
        <h1>Star Trek: Universe</h1>
        <img className='poster' src={STUniverse} alt='Star Trek: Universe'></img>
        <h2>Star Trek es una franquicia creada por Gene Roddenberry que comenzó con la serie de televisión homónima de 1966. 
        La franquicia se ha ampliado a varias películas, series de televisión, videojuegos, novelas y cómics.

        La franquicia comenzó con Star Trek: la serie original, que debutó en los Estados Unidos el 8 de septiembre de 1966.</h2>

        <h3>Sigue los viajes de la nave espacial USS Enterprise, una nave de exploración construida por la Federación Unida de Planetas en el siglo XXIII, en una misión de cinco años para «explorar nuevos y extraños mundos, buscar nuevas formas de vida y nuevas civilizaciones, atreverse a llegar a donde nadie ha ido jamás».</h3>

      </>
    )
}

export default Home;