import MenuItem from "../MenuItem/menu-item";
import './menu.css';

function Menu() {
    return ( 
    <header className="menu-wrapper">
        <nav>
          <ul className="menu">
            <MenuItem
                text='Home'
                link='/star-trek/' 
            />
            <MenuItem
                text='Episodios'
                link='/star-trek/episodios'
            />
            <MenuItem
                text='Personajes'
                link='/star-trek/personajes'
            />
            <MenuItem
                text='Citas'
                link='/star-trek/citas'
            />
          </ul>
        </nav>
    </header>
      )
}

export default Menu;