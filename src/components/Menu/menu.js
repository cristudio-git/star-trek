import MenuItem from "../MenuItem/menu-item";
import './menu.css';

function Menu() {
    return ( 
    <header className="menu-wrapper">
        <nav>
          <ul className="menu">
            <MenuItem
                text='Home'
                link='/'
            />
            <MenuItem
                text='Episodios'
                link='/episodios'
            />
            <MenuItem
                text='Personajes'
                link='/personajes'
            />
            <MenuItem
                text='Citas'
                link='/citas'
            />
          </ul>
        </nav>
    </header>
      )
}


export default Menu;