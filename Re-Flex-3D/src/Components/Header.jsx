import React from 'react';
import './Header.css';

const Header = ({ onModelChange }) => {
  const handleDropdownChange = (event) => {
    const newModelUrl = event.target.value;
    // console.log('from drop down selected:', newModelUrl); // Add this log for debugging
    onModelChange(newModelUrl);
  };

  return (
    <header className="app-header">
        <h2>Parts Catalog Viewer</h2>
        {/* Add your dropdown list here */}
        <select className="dropdown-list" onChange={handleDropdownChange}>
            <option value= 'select'>select a mechine</option>
            <option value="http://localhost:8000/media/model333G/333G.glb">333 g</option>
            {/* <option value="http://localhost:8000/models/model17G/excavator.glb">machine 2</option>
            <option value="http://localhost:8000/models/modelSK850/rideonskid_1.glb">Machine 3</option> */}
            {/* Add more options as needed */}
        </select>
    </header>
);
};

export default Header;
