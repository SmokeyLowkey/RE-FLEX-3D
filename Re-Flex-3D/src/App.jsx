import React, {useState}from 'react';
import './App.css';
import ReflexAdvancedDemo from './Components/FrontPage.jsx'; // Import ReflexAdvancedDemo
import BeatLoader from 'react-spinners/BeatLoader';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="App">
    {isLoading && 
    <div className="loading-overlay">
      <BeatLoader />
      </div>}
         <ReflexAdvancedDemo setIsLoading={setIsLoading} />
       </div>
     );
   };

export default App;
