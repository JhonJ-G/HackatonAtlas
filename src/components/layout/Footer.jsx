import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: 'Acerca de', href: '#' },
    { name: 'Contacto', href: '#' },
    { name: 'Repositorio', href: '#' },
  ];

  return (
    <footer className="bg-main-dark text-white">
      <div className="container-width">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo y descripción */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AE</span>
                </div>
                <span className="text-xl font-bold">Atlas Energético</span>
              </div>
              <p className="text-white/70 max-w-2xl mb-6">
                Proyecto desarrollado con fines educativos en el marco de un bootcamp de Inteligencia Artificial.
              </p>
              <p className="text-sm text-white/50">
                Explora, simula y analiza el potencial energético renovable en Colombia mediante tecnologías de inteligencia artificial.
              </p>
            </div>

            {/* Enlaces */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Enlaces</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-white/70 hover:text-accent-green transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-white/50">
                © {currentYear} Atlas Inteligente de Potencial Energético de Colombia
              </p>
              <div className="flex items-center space-x-6 text-sm text-white/50">
                <span>Desarrollado con React + IA</span>
                <span>•</span>
                <span>Colombia 🇨🇴</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;