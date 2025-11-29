import React from 'react';

const SectionTitle = ({ 
  title, 
  subtitle, 
  align = 'center',
  className = '',
  titleClassName = '',
  subtitleClassName = ''
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <div className={`${alignClasses[align]} ${className}`}>
      <h2 className={`text-3xl lg:text-4xl font-bold text-main-dark mb-4 ${titleClassName}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg text-main-dark/70 max-w-3xl ${align === 'center' ? 'mx-auto' : ''} ${subtitleClassName}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;