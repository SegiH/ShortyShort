import React, { useContext } from "react";
import { DataContext } from "./data-context";

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#2c3e50',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
};

const navStyle = {
    display: 'flex',
    gap: '1rem',
};

const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
};

const Header = ({ currentRoute, onNavigate }) => {
    const {
        adminEnabled,
        routes
    } = useContext(DataContext);

    return (
        <header style={headerStyle}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Shorty Short URL Shortener</h1>

            {adminEnabled &&
                <nav style={navStyle}>
                    {routes.map((route, index) => {
                        return (
                            <a key={index} style={{ ...linkStyle, backgroundColor: currentRoute === route.Path ? route.BackgroundColor : 'transparent' }}
                                onClick={() => onNavigate(route.Path)}
                            >{route.DisplayName}</a>
                        )
                    })}
                </nav>
            }
        </header>
    )
};

export default Header;