import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import '../App.css';

import Model from './Model';
import OrientationGizmo from './OrientationGizmo';




const Viewer = React.memo(({ 
  onPartNumberSelect, 
  setHierarchyData ,
  setSelectedMesh, 
  onMeshSelect, 
  selectedMesh, 
  modelIdentifier,
  setModelLoaded,
  checked,
  centroidsRef, 
  originalPositionsRef,
  setIsLoading
}) => {
  // console.log("Viewer - Received modelIdentifier:", modelIdentifier);
  // console.log('Viewer component rendering');
  const mountRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [camera2, setCamera2] = useState(null);  // Secondary camera (if used)
  const orbitControlsRef = useRef(null);
  const [cameraMoved, setCameraMoved] = useState(false);
  const [renderer, setRenderer] = useState(null);
  const originalMaterialsRef = useRef(new Map());
  const [selectedMeshUuid, setSelectedMeshUuid] = useState(null);
  const gizmoRef = useRef(null);
  const [explodedView, setExplodedView] = useState(0); // Slider value for exploded view

  // EffectComposer and RenderPass references
  const composerRef = useRef(null);
  const renderPassRef = useRef(null);

  useEffect(() => {
    // Function to remove existing gizmo
    const removeExistingGizmo = () => {
      if (gizmoRef.current && gizmoRef.current.firstChild) {
        gizmoRef.current.removeChild(gizmoRef.current.firstChild);
      }
    };
  
    // Add the gizmo
    if (gizmoRef.current && camera) {
      removeExistingGizmo(); // Remove existing gizmo if present
      const gizmo = new OrientationGizmo(camera, {/* options */});
      gizmoRef.current.appendChild(gizmo);
    }
  
    // Cleanup function
    return () => {
      removeExistingGizmo();
    };
  }, [camera]); // Dependency on 'camera'
  

  // Function to handle mesh selection
  const handleMeshSelection = useCallback((meshUuid) => {
    // console.log("Mesh selected with UUID:" ,meshUuid);
    if (!sceneRef.current) return;
  
    // Reset all meshes to their original materials and full opacity
    sceneRef.current.traverse((child) => {
      if (child.isMesh && originalMaterialsRef.current.has(child.uuid)) {
        child.material = originalMaterialsRef.current.get(child.uuid);
        child.material.opacity = 1; // Reset to full opacity
        child.material.transparent = false;
      }
    });
  
    let selectedObject = sceneRef.current.getObjectByProperty('uuid', meshUuid);
    if (selectedObject) {
      // console.log("Selected Object:", selectedObject);
      // console.log("Selected Object UserData:", selectedObject.userData);

      if (selectedObject.userData?.part_number) {
        // console.log("Part Number:", selectedObject.userData.part_number);
        onPartNumberSelect(selectedObject.userData.part_number);
      }
      // Store the UUIDs of all child meshes if the selected object is a group
      const childUuids = new Set();
      if (selectedObject.type === 'Group'|| selectedObject.children.length > 0) {
        selectedObject.traverse((child) => {
          if (child.isMesh) {
            childUuids.add(child.uuid);
            setMaterialOpacity(child, child.uuid, 1); // Set opacity for child meshes to 100%
          }
        });
      }
  
      // Dim all non-selected (and non-child of selected group) meshes to 20% opacity
      sceneRef.current.traverse((child) => {
        if (child.isMesh && !childUuids.has(child.uuid) && child.uuid !== meshUuid) {
          setMaterialOpacity(child, child.uuid, 0.2); // Non-selected meshes get 20% opacity
        }
      });
  
      // If the selected object itself is a mesh, set its opacity to 100%
      if (selectedObject.isMesh) {
        setMaterialOpacity(selectedObject, meshUuid, 1);
      }
      if (selectedObject && selectedObject.userData?.part_number) {
        onPartNumberSelect(selectedObject.userData.part_number);
      }
      // Check if camera2 is initialized before switching
      if (camera2) {
        fitCameraToSelection(camera2, orbitControlsRef.current, [selectedObject]);
        // switchCamera(camera2);
        // Animate camera movement
        gsap.to(camera.position, {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
          duration: 1,
          onUpdate: () => {
              if (orbitControlsRef.current) {
                  orbitControlsRef.current.update();
              }
          }
        });

        // Optionally, animate changing the controls target as well
        gsap.to(orbitControlsRef.current.target, {
          x: selectedObject.position.x,
          y: selectedObject.position.y,
          z: selectedObject.position.z,
          duration: 2
        });
    } else {
        // Fallback to main camera if camera2 is not available
        fitCameraToSelection(camera, orbitControlsRef.current, [selectedObject]);
    }

    }
  
    setSelectedMeshUuid(meshUuid); // Update local state
    onMeshSelect(meshUuid); // Notify parent component

  }, [camera, camera2, onMeshSelect, onPartNumberSelect]);
  
  // Helper function to set material opacity
  const setMaterialOpacity = (mesh, uuid, opacity) => {
    if (!originalMaterialsRef.current.has(uuid)) {
      originalMaterialsRef.current.set(uuid, mesh.material.clone());
    }
    mesh.material.opacity = opacity;
    mesh.material.transparent = opacity < 1;
  };
  
  
 
  // Reset all materials to their original state
  const resetMaterials = useCallback(() => {
    if (!sceneRef.current) return;
  
    sceneRef.current.traverse((child) => {
      if (child.isMesh && originalMaterialsRef.current.has(child.uuid)) {
        // Reset the material of the mesh to its original
        child.material = originalMaterialsRef.current.get(child.uuid);
        child.material.needsUpdate = true; // Ensure the material update is noticed by Three.js
      }
    });
  
    onMeshSelect(null); // Reset selected mesh state if needed
  }, [onMeshSelect]);
  
  // Function to get all visible objects
  const getVisibleObjects = useCallback(() => {
    const visibleObjects = [];
    sceneRef.current.traverse((object) => {
      if (object.isMesh && object.visible) {
        visibleObjects.push(object);
      }
    });
    return visibleObjects;
  }, []);
  useEffect(() => {
    // console.log("Viewer model URL:", modelUrl);
    // console.log('useEffect for setup called');
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(80, 100, 20);
    const camera2 = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setClearColor(0xf5f5f5, 0.5); // Set clear color to white
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    setScene(scene);
    setCamera(camera);
    setCamera2(camera2);
    setRenderer(renderer);
    
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;
    const renderPass = new RenderPass(scene, camera);
    renderPassRef.current = renderPass;
    composer.addPass(renderPass);

    const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass.visibleEdgeColor.set(0xff0000);
    outlinePass.hiddenEdgeColor.set(0x22090a);
    composer.addPass(outlinePass);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    orbitControlsRef.current = controls
    controls.addEventListener('change', () => {
      setCameraMoved(true); // existing logic

      // Check if gizmoRef.current is defined and has updateGizmoOrientation method
      if (gizmoRef.current && typeof gizmoRef.current.updateGizmoOrientation === 'function') {
          gizmoRef.current.updateGizmoOrientation();
      }
    });
    controls.addEventListener('start', () => setCameraMoved(false));
    controls.addEventListener('change', () => setCameraMoved(true));  

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
      const bounds = mountRef.current.getBoundingClientRect();
      
      mouse.x = (event.offsetX / bounds.width) * 2 - 1;
      mouse.y = -(event.offsetY / bounds.height) * 2 + 1;
      
      raycaster.params.Mesh.threshold = 0.1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(getVisibleObjects(), true);

      if (intersects.length > 0) {
        const intersected = intersects[0].object;
        // Update outline pass
        outlinePass.selectedObjects = [intersected];
      } else {
        outlinePass.selectedObjects = [];
      }
    }

        
    // Mouse click event
    function onDoubleClick(event) {
      event.preventDefault();
      const bounds = mountRef.current.getBoundingClientRect();
      mouse.x = (event.offsetX / bounds.width) * 2 - 1;
      mouse.y = -(event.offsetY / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(getVisibleObjects(), true);

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;
        handleMeshSelection(intersectedMesh.uuid, scene);
      }
    }

    renderer.domElement.addEventListener('dblclick', onDoubleClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      // renderer.render(scene, camera);
      composer.render();
    };
    animate();

    // Handle resize
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      // console.log('useEffect cleanup called');
      // console.log("Component unmounting, starting cleanup process");
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      
     
    
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      resetMaterials(); // Indicate component is unmounting
      controls.removeEventListener('start', () => setCameraMoved(false));
      controls.removeEventListener('change', () => setCameraMoved(true));
    };
    
  }, [setSelectedMesh, modelIdentifier]);

  
  function fitCameraToSelection(camera, controls, selection, fitOffset = 1.2) {
    if (!camera) {
      console.error("Camera is not available for fitCameraToSelection.");
      return;
    }
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    const box = new THREE.Box3();

    box.makeEmpty();
    for(const object of selection) {
      box.expandByObject(object);
    }
    
    box.getSize(size);
    box.getCenter(center );
    
    const maxSize = Math.max(size.x, size.y, size.z);
    console.log("Max size:", maxSize);
    if (camera.fov <= 0) {
      console.error("Camera FOV is not set correctly:", camera.fov);
      return;
    }
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
    console.log("Fit height distance:", fitHeightDistance);
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);
    
    const direction = controls.target.clone()
      .sub(camera.position)
      .normalize()
      .multiplyScalar(distance);
  
    controls.maxDistance = distance * 10;
    controls.target.copy(center);
    
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
  
    camera.position.copy(controls.target).sub(direction);
    
    controls.update();
  }

  useEffect(() => {
    if (selectedMesh) {
      // console.log("clicked on hierarchy item:", selectedMesh);
      handleMeshSelection(selectedMesh);
    }
  }, [selectedMesh, handleMeshSelection]); // Respond to selectedMesh changes

  useEffect(() => {
    // console.log("Current checked state:", checked);
    if (!scene || !scene.children) return;
  
    scene.traverse((object) => {
      if (object.isMesh) {
        object.visible = checked.includes(object.uuid);
      }
    });
  }, [scene, checked]);

  useEffect(() => {
    // Logic for exploded view
    if (scene && centroidsRef) {
      // console.log("Exploded view logic triggered", {explodedView});
      scene.traverse((parent) => {
        if (parent.children && parent.children.length > 0) {
          const centroid = centroidsRef.current.get(parent.uuid);
          if (centroid) {
            parent.children.forEach(child => {
              if (child.isMesh && child.visible) {
                const direction = child.position.clone().sub(centroid).normalize();
                const originalPosition = originalPositionsRef.current.get(child.uuid);
                if (originalPosition) {
                  const explodedPosition = originalPosition.clone().add(direction.multiplyScalar(explodedView));
                  child.position.lerp(explodedPosition, 0.1);
                  // console.log(`Applying exploded view to child (UUID: ${child.uuid})`);
                }
              }
            });
          }
        }
      });
    }
  }, [scene, explodedView, centroidsRef]);

  const resetPositions = useCallback(() => {
    if (!originalPositionsRef.current || !sceneRef.current) return;
    const scene = sceneRef.current;
    // Reset positions logic
    originalPositionsRef.current.forEach((originalPosition, uuid) => {
      const object = scene.getObjectByProperty('uuid', uuid);
      if (object) {
        object.position.copy(originalPosition);
      }
    });
    //reset the slider
    setExplodedView(0);
    // Additional code as needed
  }, [originalPositionsRef, sceneRef, setExplodedView]);
  
  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={gizmoRef} className="gizmo-container">
      
      </div>
      {scene && renderer && camera && (
        <Model 
        scene={scene} 
        renderer={renderer} 
        setHierarchy={setHierarchyData} 
        modelIdentifier={modelIdentifier}
        setIsModelLoaded={setModelLoaded}
        explodedView={explodedView}
        centroidsRef={centroidsRef}
        originalPositionsRef={originalPositionsRef}
        setIsLoading={setIsLoading}
        />
      )}
      <button onClick={resetPositions}>Reset Positions</button>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={explodedView} 
        onChange={(e) => setExplodedView(Number(e.target.value))}
      />
      
    </div>
  );
});

export default Viewer;
