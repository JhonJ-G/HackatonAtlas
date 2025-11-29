import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  type = 'button',
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'font-medium px-6 py-3 rounded-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variants = {
    primary: 'bg-accent-green hover:bg-accent-green/90 text-white hover:scale-105',
    secondary: 'btn-secondary',
    outline: 'bg-transparent hover:bg-main-dark/5 text-main-dark border border-main-dark/20 hover:border-main-dark/40',
    ghost: 'bg-transparent hover:bg-accent-green/10 text-accent-green'
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;