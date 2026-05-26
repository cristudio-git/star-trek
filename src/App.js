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
          case "/":
            return <Home/>
          case "/personajes":
            return <Personajes/>
          case "/citas":
            return <Citas/>
          case "/episodios":
            return <Episodios/>
          default:
            return <Home/> //Aca podemos retornar una pagina 404
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
