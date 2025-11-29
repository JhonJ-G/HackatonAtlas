import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import logoGemini from '../../img/logogemini.png';
import logoApp from '../../img/logo.png';

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: 'Explorar Mapa', href: '/mapa' },
    { name: 'Simulador', href: '/simulador' },
    { name: 'Acerca del Modelo', href: '/modelo' },
    { name: 'Chat IA', href: '/chat' },
  ];

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 glass-effect shadow-lg">
        <div className="container-width">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-slate-800 hover:text-accent-green transition-colors"
            >
              <img
                src={logoApp}
                alt="Atlas Energético logo"
                className="w-9 h-9 object-contain rounded-md shadow-sm"
              />
              <span className="text-xl font-semibold text-slate-800 tracking-tight hidden md:block">Atlas Energético</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${item.name === 'Chat IA' ? 'inline-flex items-center gap-1.5' : ''} text-sm font-medium transition-colors hover:text-accent-green ${
                    isActive(item.href) 
                      ? 'text-accent-green border-b-2 border-accent-green pb-1' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.name === 'Chat IA' && (
                    <img
                      src={logoGemini}
                      alt="Gemini"
                      className="w-4 h-4 object-contain"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <Link to="/mapa">
              <Button variant="primary" className="hidden md:block">
                Comenzar
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden text-slate-700 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Abrir menú de navegación"
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Fondo semitransparente */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Panel del menú */}
          <nav className="absolute top-0 right-0 h-full w-72 max-w-full bg-white shadow-xl rounded-l-3xl p-6 flex flex-col transform transition-transform duration-200">
            {/* Cabecera del panel */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={logoApp}
                  alt="Atlas Energético logo"
                  className="w-8 h-8 object-contain rounded-md shadow-sm"
                />
                <span className="text-lg font-semibold text-slate-800 tracking-tight">
                  Atlas Energético
                </span>
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Cerrar menú"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links de navegación */}
            <ul className="flex flex-col gap-1 flex-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`${item.name === 'Chat IA' ? 'inline-flex items-center gap-1.5' : 'block'} rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span>{item.name}</span>
                    {item.name === 'Chat IA' && (
                      <img
                        src={logoGemini}
                        alt="Gemini"
                        className="w-4 h-4 object-contain"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Botón "Comenzar" en móvil */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <Link
                to="/mapa"
                className="inline-flex w-full items-center justify-center rounded-xl bg-accent-green px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-green/90 transition-colors"
                onClick={closeMobileMenu}
              >
                🚀 Comenzar Exploración
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;