import './App.css';
import Menu from './components/Menu/menu';
import Home from './components/Home/home';
import Personajes from './components/Personajes/personajes';
import Citas from './components/Citas/citas';
import Episodios from './components/Episodios/episodios';
import Footer from './components/footer';

function App() {
  const currentURL = window.location.pathname;

  function renderContent() {
    switch (currentURL) {
          // En tu PC local será "/" y en GitHub será "/star-trek/"
          case "/":
          case "/star-trek/":
            return <Home/>
          
          case "/star-trek/personajes":
          case "/personajes": // Dejamos este por si pruebas en local
            return <Personajes/>
          
          case "/star-trek/citas":
          case "/citas":
            return <Citas/>
          
          case "/star-trek/episodios":
          case "/episodios":
            return <Episodios/>
          
          default:
            return <Home/> 
        }
  }

  return (
    <div className="App">
      <Menu/>
      <main>
      { renderContent() }
      </main>
      <Footer/>
    </div>
  );
}

export default App;