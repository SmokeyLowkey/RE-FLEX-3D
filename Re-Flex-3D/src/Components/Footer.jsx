import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      {/* Add your footer content here */}
      <p>&copy; {new Date().getFullYear()} Parts Catalog, Inc.</p>
    </footer>
  );
};

export default Footer;
