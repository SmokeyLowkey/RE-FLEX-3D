import React, { useState, useCallback, useEffect, useRef } from 'react';
import {TreeView, TreeItem} from '@mui/x-tree-view';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import 'react-reflex/styles.css';
import { Checkbox } from '@mui/material';
import Autocomplete from '@mui/lab/Autocomplete';
import TextField from '@mui/material/TextField';

import Header from './Header';
import Viewer from './Viewer'; // Adjust the import path as needed
import MeshDetailsPanel from './DetailPanels';

const ReflexAdvancedDemo = () => {
  // Hooks to manage the resize state
  const [resizing, setResizing] = useState(false);
  const [newHierarchyData, setHierarchyData] = useState([]);
  const [selectedMesh, setSelectedMesh] = useState(null); // New state for selected mesh
  const [selectedPartNumber, setSelectedPartNumber] = useState(null); // New state for selected part number
  const [modelUrl, setModelUrl] = useState('select');
  const [expandedNodes, setExpandedNodes] = useState([]);
  const treeItemRefs = useRef({});
  const [checked, setChecked] = useState([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const centroidsRef = useRef(new Map());
  const originalPositionsRef = useRef(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [modelIdentifier, setModelIdentifier] = useState("");

  
  useEffect(() => {
   
    setHierarchyData([]);
    // console.log("Hierarchy Data: ", newHierarchyData);
    setSelectedMesh(null);
   
  }, [modelUrl]);

  const onResize = (e) => {
    if (e.domElement) {
      setResizing(true);
      e.domElement.classList.add('resizing');
    }
  };

  const onStopResize = (e) => {
    if (e.domElement) {
      setResizing(false);
      e.domElement.classList.remove('resizing');
    }
  };

  const resizeProps = {
    onStopResize: onStopResize,
    onResize: onResize
  };

  // const handleModelChange = (newModelUrl) =>{
  //   setModelUrl(newModelUrl);
  // }

  // Function to recursively collect all node IDs
  const collectNodeIds = useCallback((nodes) => {
    return nodes.reduce((acc, node) => {
      acc.push(node.id);
      if (node.children && node.children.length > 0) {
        acc.push(...collectNodeIds(node.children));
      }
      return acc;
    }, []);
  }, []);

  const setHierarchyDataMemoized = useCallback((data) => {
    setHierarchyData(data);
    // console.log("Hierarchy Data updated: ", data);
    const allNodeIds = collectNodeIds(data);
    setChecked(allNodeIds);
    setExpandedNodes(allNodeIds);
  }, [collectNodeIds]);

  useEffect(() => {
    if (selectedMesh) {
      const elementToScroll = treeItemRefs.current[selectedMesh];
      if (elementToScroll) {
        elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedMesh]);

  const handleNodeSelect = useCallback((event, nodeId) => {
    event.stopPropagation();
    setSelectedMesh(nodeId);
  }, []);

  //helper function for children meshes 
  const getChildIds = (nodeId, nodes) => {
    const findNodeById = (id, nodes) => {
        for (const node of nodes) {
            if (node.id === id) {
                return node;
            }
            if (node.children) {
                const found = findNodeById(id, node.children);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    const findAllChildIds = (node) => {
        let ids = [];
        if (node && node.children) {
            ids = node.children.map(child => child.id);
            node.children.forEach(child => {
                ids = ids.concat(findAllChildIds(child));
            });
        }
        return ids;
    };

    const parentNode = findNodeById(nodeId, nodes);
    return parentNode ? findAllChildIds(parentNode) : [];
  };


  const handleToggle = (value) => {
    let newChecked = [...checked];
    const childIds = getChildIds(value, newHierarchyData);

    if (checked.includes(value)) {
      //uncheck the parent and children
        newChecked = newChecked.filter(id => id !== value && !childIds.includes(id));
    } else {
      //check the node and its children
        newChecked = Array.from(new Set([...newChecked, value, ...childIds]));
    }

    setChecked(newChecked);
    // console.log("Checked state updated:", newChecked);
  };

  useEffect(() => {
    // Assuming newHierarchyData is the correct data you need
    setHierarchyData(newHierarchyData);
  
    // Initialize the checked state with all node IDs
    if (newHierarchyData && newHierarchyData.length > 0) {
      const allNodeIds = collectNodeIds(newHierarchyData);
      setChecked(allNodeIds);
    }
  }, [newHierarchyData]); // Dependency on your tree data
  
  useEffect(() => {
    // console.log("Current checked state:", checked);
  }, [checked]);
  // Function to flatten the tree for the Autocomplete
  const flattenTree = (node, prefix = '') => {
    const nodeName = `${prefix}${node.name}`;
    const nodes = [{ name: nodeName, id: node.id }];

    if (node.children) {
      node.children.forEach(child => {
        nodes.push(...flattenTree(child, `${nodeName} > `));
      });
    }
    return nodes;
  };

  // Effect to update Autocomplete options based on the search query
  useEffect(() => {
    const allNodes = newHierarchyData.flatMap(node => flattenTree(node));
    setAutocompleteOptions(allNodes.filter(node => 
      node.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [searchQuery, newHierarchyData]);

  // Function to render tree view (similar to previous example)
  // In your ReflexAdvancedDemo or FrontPage component
  const renderTree = (nodes) => (
    <TreeItem 
    key={nodes.id} 
    nodeId={nodes.id} 
    label={
      <>
          <Checkbox
            edge="start"
            checked={checked.includes(nodes.id)}
            onChange={() => handleToggle(nodes.id)}
            onClick={(event) => {
              event.stopPropagation();  // Prevent tree item selection
              handleToggle(nodes.id);
            }}
            onContextMenu={(event) => handleRightClick(event, nodes.id)}
            tabIndex={-1}
            disableRipple
            style={{transform:'scale(0.75)'}}
          />
          <span style = {{fontSize: '12px'}}>{nodes.name.replace(/_/g, " ") || 'Unnamed Node'}</span>
      </>
    }
    ref={(el) => treeItemRefs.current[nodes.id] = el}
    onClick={() => handleNodeSelect(event, nodes.id)} // Changed to onClick
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)): null}
    </TreeItem>
  );

  const handleRightClick = (event, nodeId) => {
    event.preventDefault(); // Prevent default right-click menu
    event.stopPropagation(); // Prevent other event handlers from executing
    const childIds = getChildIds(nodeId, newHierarchyData);
    const newChecked = new Set([nodeId, ...childIds]);
    // Update the checked state to only include the right-clicked node
    setChecked(Array.from(newChecked));
  };

  const handlePartNumberSelect = useCallback((newPartNumber) => {
    // console.log('Selected part number:', newPartNumber);
    setSelectedPartNumber(newPartNumber); // Update the selected part number state
  }, []);
  const onModelChange = (identifier) => {
    console.log("Updating modelIdentifier in ReflexAdvancedDemo to:", modelIdentifier);
    setModelIdentifier(identifier);
  }; 

  useEffect(() => {
    console.log("ReflexAdvancedDemo - Current modelIdentifier:", modelIdentifier);
  }, [modelIdentifier]);

  return (
    <ReflexContainer orientation="horizontal">
      {/* Header */}
      <ReflexElement className="header" flex={0.1}>
        <Header onModelChange={onModelChange}/>
      </ReflexElement>
      
      {/* Main Content */}
      <ReflexElement>
        <ReflexContainer orientation="vertical">
          {/* Left Pane */}
          <ReflexElement {...resizeProps} className='reflex-element' style={{ overflowY: 'auto', overflowX: 'auto', height: 'calc(100vh - YourHeaderAndFooterHeight)' }}>
          {/* Auto complete search input */}
          <Autocomplete
            options={autocompleteOptions}
            getOptionLabel={(option) => option.name}
            style={{ width: '100%', padding: '10px' }}
            renderInput={(params) => (
              <TextField {...params} label="Search" variant="outlined" />
            )}
            inputValue={searchQuery}
            onInputChange={(event, newInputValue) => {
              setSearchQuery(newInputValue);
            }}
            onChange={(event, newValue) => {
              if (newValue) {
                setSelectedMesh(newValue.id);  // Assuming `id` is the identifier for the mesh
              }
            }}
          />
          <TreeView
          selected={selectedMesh}
          expanded={expandedNodes}
          onNodeSelect={handleNodeSelect}
          >
            {newHierarchyData && newHierarchyData.map((node) => renderTree(node))}
          </TreeView>
          </ReflexElement>
          
          <ReflexSplitter {...resizeProps} />
          
          {/* Middle Pane */}
          <ReflexElement flex={0.5} {...resizeProps} className='reflex-element'>
          <div style={{ width: '100%', height: '100%' }}>
          {modelIdentifier && (
          <Viewer 
            setHierarchyData={setHierarchyDataMemoized}
            onMeshSelect={setSelectedMesh}
            selectedMesh={selectedMesh}
            onPartNumberSelect ={handlePartNumberSelect}
            setModelLoaded = {setIsModelLoaded}
            checked = {checked}
            centroidsRef={centroidsRef}
            originalPositionsRef = {originalPositionsRef}
            modelIdentifier={modelIdentifier}
            >
           
          </Viewer>
          )}
          </div>
          </ReflexElement >
          
          <ReflexSplitter {...resizeProps} />
          
          {/* Right Pane */}
          <ReflexElement {...resizeProps} className='reflex-element' style={{ overflowY: 'auto', overflowX: 'auto', height: 'calc(100vh - YourHeaderAndFooterHeight)' }}>
            <MeshDetailsPanel selectedPartNumber={selectedPartNumber} modelUrl={modelUrl}/>
          </ReflexElement>
        
        </ReflexContainer>
      </ReflexElement>
      
      {/* Footer */}
      {/* <ReflexElement className="footer" flex={0.1}>
        <div className="pane-content">
          <label>Footer (fixed)</label>
        </div>
      </ReflexElement> */}
    </ReflexContainer>
  );
};

export default ReflexAdvancedDemo;
