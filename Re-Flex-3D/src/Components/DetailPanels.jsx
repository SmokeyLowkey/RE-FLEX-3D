import React, { useState, useEffect } from 'react';


const MeshDetailsPanel = ({ selectedPartNumber, modelUrl}) => {
  const [meshDetails, setMeshDetails] = useState(null);

  useEffect(() => {
    console.log("Effect executed in MeshDetailsPanel", { selectedPartNumber, modelUrl });
    if (selectedPartNumber && modelUrl) {
      console.log('Selected Part Number:', selectedPartNumber);
      
      const endpoint = determineEndpoint(modelUrl);
      const fullUrl = `http://localhost:8000/api/${endpoint}/${selectedPartNumber}/`;
      console.log("Fetching URL:", fullUrl); // Check the constructed URL
      fetch(fullUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched Data:', data);
          const detailedInfo = {
            name: data.part_name, // Adjust field name as per your API response
            part_number: data.part_number,
            quantity: data.quantity,
            description: data.description
          };
          setMeshDetails(detailedInfo);
        })
        .catch(error => console.error('Error fetching mesh details:', error));
    }
  }, [selectedPartNumber, modelUrl]);

  // Function to determine the API endpoint based on the model URL
  const determineEndpoint = (url) => {
    const modelName = url.match(/model(\d+)[A-Z]/i)[1]; // Extract the model number
    return `parts${modelName}g`; // Construct the endpoint, like 'parts333g'
  };

  return (
    <div className="mesh-details-panel">
    <div className="mesh-details-content">
      {meshDetails ? (
        <div>
          <h3>{meshDetails.name}</h3>
          <p>Part Number: {meshDetails.part_number}</p>
          <p>Quantity: {meshDetails.quantity}</p>
          <div>
              <strong>Description:</strong>
              {/* Rendering the HTML content safely */}
              <div dangerouslySetInnerHTML={{ __html: meshDetails.description }} />
            </div>
          {/* ... other details ... */}
        </div>
      ) : (
        <p>Select an object to see details</p>
      )}
    </div>  
    </div>
  );
};

export default MeshDetailsPanel;