import React, { useEffect, useRef, useState } from 'react';
import { RGBELoader } from 'three-stdlib';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';



const Model = ({ 
  scene, 
  renderer, 
  setHierarchy, 
  checked, 
  setIsModelLoaded, 
  explodedView,
  originalPositionsRef,
  modelIdentifier,
  setIsLoading
}) => {
  const modelRef = useRef(null);  // Add this line
  const centroidsRef = useRef(new Map());
  // const [centroidsCalculated, setCentroidsCalculated] = useState(false);
  
  // Function to store original positions
  const storeOriginalPositions = (node) => {
    node.traverse(child => {
        if (child.isMesh) {
            // Store the original position
            originalPositionsRef.current.set(child.uuid, child.position.clone());
        }
    });
  };

  // Function to calculate centroids of parent nodes
  const calculateCentroids = (node, centroidsRef, processedParents = new Set()) => {
    if (node.children && node.children.length > 0 && !processedParents.has(node.uuid)) {
        const centroid = new THREE.Vector3();
        let count = 0;

        node.children.forEach(child => {
            if (child.isMesh) {
                centroid.add(child.position);
                count++;
            }
            // Recursive call for children nodes
            if (child.children && child.children.length > 0) {
                calculateCentroids(child, centroidsRef, processedParents);
            }
        });

        if (count > 0) {
            centroid.divideScalar(count);
            centroidsRef.current.set(node.uuid, centroid);
            // console.log(`Centroid calculated for parent (UUID: ${node.uuid}):`, centroid);
        }

        processedParents.add(node.uuid);
    }
  };

  // Initial call for the scene
  // calculateCentroids(scene, centroidsRef);

  useEffect(() => {    
    // console.log("useEffect triggered with modelIdentifier:", modelIdentifier);
    const fetchAndLoadModel = async () => {
      if (!scene || !renderer || !modelIdentifier) {
        // console.log("Required parameters for model loading are missing");
        return;
      }
      
      // console.log("Attempting to fetch signed URL for modelIdentifier:", modelIdentifier);
    
      try {
        setIsLoading(true); //Start loader
        // console.log("Fetching from URL:", `/api/get-signed-url/${modelIdentifier}`);
        const baseUrl = import.meta.env.VITE_RENDER_BASE_URL;
        // console.log("Base URL:", baseUrl);
        const response = await fetch(`${baseUrl}/api/get-signed-url/${modelIdentifier}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            // 'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        const signedUrl = data.url;  // Extract the URL from the JSON object

    
        if (signedUrl) {
          // console.log(`Signed URL received: ${signedUrl}`);
          // Your existing logic to remove the current model
          if (modelRef.current) {
            // console.log("Removing existing model from scene");
            scene.remove(modelRef.current);
            modelRef.current = null;
          }
    
          // Load the model with the signed URL
          // console.log(`Loading model from URL: ${signedUrl}`);
          const loader = new GLTFLoader();
          loader.load(signedUrl, (gltf) => {
            // console.log("Model loaded successfully", gltf);
            modelRef.current = gltf.scene;
            scene.add(gltf.scene);
    
            // Rest of the logic after loading the model
            calculateCentroids(gltf.scene, centroidsRef);
            storeOriginalPositions(gltf.scene);
            setIsModelLoaded(true);
            const newHierarchyData = extractHierarchy(gltf.scene);
            setHierarchy(newHierarchyData);
            setIsLoading(false)
    
          }, undefined, (error) => {
            console.error("Error loading model:", error);
            setIsLoading(false)
          });
        } else {
          console.log("No signed URL received");
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching signed URL:', error);
        setIsLoading(false)
      }
    };
    
    fetchAndLoadModel();

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/safari_sunset_4k.hdr', function (texture) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      texture.dispose();
      pmremGenerator.dispose();
    });

    // Cleanup function
    return () => {
      if (modelRef.current) {
        // console.log("Component unmounting, removing model from scene");
        scene.remove(modelRef.current); // Remove the model from the scene
        
        // Dispose of the model's resources
      }
    };
  }, [scene, renderer, setHierarchy, modelIdentifier,setIsModelLoaded, originalPositionsRef, setIsLoading]);

  function extractHierarchy(gltfScene) {
    let nodeMap = {};
    let rootMap = {};
  
    gltfScene.traverse((node) => {
      // console.log('Node:', node);
      nodeMap[node.uuid] = {
        id: node.uuid,
        name: node.name || 'Unnamed Node',
        partNumber : node.userData.part_number,
        parent: node.parent ? node.parent.uuid : null,
        children: []
      };
  
      // If the node has a parent, add this node as a child to its parent
      if (node.parent && nodeMap[node.parent.uuid]) {
        nodeMap[node.parent.uuid].children.push(nodeMap[node.uuid]);
        // If this node has a parent, it's not a root so ensure it's not in rootMap
        delete rootMap[node.uuid];
      } else {
        // If this node has no parent, consider it a root candidate
        rootMap[node.uuid] = nodeMap[node.uuid];
      }
    });

    // Now rootMap contains only nodes that are not children of any other nodes
    let roots = Object.values(rootMap);
    // console.log('Unique Root Nodes:', roots);
    return roots;
  }

  useEffect(() => {
    // console.log("Visibility update useEffect triggered");
    // console.log("Current checked state:", checked);
    if (!scene || !modelRef.current || !checked) return;
    // console.log("Updating visibility based on 'checked' state:", checked);
    scene.traverse((object) => {
        if (object.isMesh) {
          const isVisible = checked.includes(object.uuid);
          object.visible = isVisible;
        }
    });
  }, [scene, checked]);
  useEffect(() => {
    if (!scene || !modelRef.current) return;
    
    scene.traverse((parent) => {
        if (parent.children && parent.children.length > 0) {
            const centroid = centroidsRef.current.get(parent.uuid);
            if (centroid) {
                parent.children.forEach(child => {
                    if (child.isMesh && child.visible) { // Check if the mesh is visible
                        const originalPosition = originalPositionsRef.current.get(child.uuid);
                        if (originalPosition) { // Check if original position exists
                            const direction = child.position.clone().sub(centroid).normalize();
                            const explodedPosition = originalPosition.clone().add(direction.multiplyScalar(explodedView));
                            child.position.lerp(explodedPosition, 0.1); // Smooth transition
                        }
                    }
                });
            }
        }
    });
  }, [scene, explodedView]); // Dependency on 'explodedView'


  return null; // This component does not render anything itself
};

export default Model;

