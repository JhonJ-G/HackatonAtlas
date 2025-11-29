import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Siempre que cambie la ruta, subimos al inicio de la página
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // scroll instantáneo para evitar efectos raros
    });
  }, [pathname]);

  return null;
}
