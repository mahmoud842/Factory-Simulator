import { useState, useCallback, useRef ,useEffect,useMemo } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDnD } from './ContextDnD';
import Machine from './Machine/Machine.jsx';
import Queue from './Queue/Queue.jsx';
import Link from './Link/Link.jsx';
import Product from './Product/Product.jsx';
import GraphDTO from './DTOs/GraphDTO.jsx';
import SocketHandler from './SocketHandler.jsx';
import './App.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [itemsNumber, setItemsNumber] = useState(5);
  const { screenToFlowPosition } = useReactFlow();
  const [type, setType] = useDnD();
  const graphDTORef = useRef(null);
  const socketHandler = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    console.log('Animation stopped!');
  };

  const id = useRef(0);

  const getId = () =>` dndnode_${id.current++}`;

  const nodeTypes = {
    Machine,
    Queue,
    Product,
  };
  
  const edgeTypes = useMemo(() => ({
    Link: (props) => <Link {...props} isAnimating={isAnimating} />
  }), [isAnimating]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
  
    if (!sourceNode || !targetNode) return;
  
    if (sourceNode.type === targetNode.type) {
      console.log(`Invalid connection: ${sourceNode.type} to ${targetNode.type}`);
      return;
    }

    if (sourceNode.type === 'Machine') {
      const existingEdge = edges.find(edge => edge.source === params.source);
      if (existingEdge) {
        console.log('Machine already has an output connection');
        return;
      }
    }
  
    const newEdge = { ...params, type: 'Link' };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [nodes, edges]);

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
        event.preventDefault();
        if (!type) return;

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        if (type === 'Delete') {
          // Check if dropping on a node
          const nodeToDelete = nodes.find(node => {
              const nodeWidth = 90; // Approximate node width
              const nodeHeight = node.type === 'Queue' 
                  ? node.data.products.length * 20 + 50 
                  : 50; // Approximate node height
              
              return (
                  position.x >= node.position.x &&
                  position.x <= node.position.x + nodeWidth &&
                  position.y >= node.position.y &&
                  position.y <= node.position.y + nodeHeight
              );
          });

          if (nodeToDelete) {
              // Delete the node and its connected edges
              setNodes(nodes => nodes.filter(n => n.id !== nodeToDelete.id));
              setEdges(edges => edges.filter(e => 
                  e.source !== nodeToDelete.id && e.target !== nodeToDelete.id
              ));
              return;
          }

          // Check if dropping on an edge
          const edgeToDelete = edges.find(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return false;

              // Calculate the line between source and target
              const startX = sourceNode.position.x + 45; // half of node width
              const startY = sourceNode.position.y + 25; // half of node height
              const endX = targetNode.position.x + 45;
              const endY = targetNode.position.y + 25;

              // Calculate distance from drop point to line
              const a = endY - startY;
              const b = startX - endX;
              const c = startY * (endX - startX) - startX * (endY - startY);
              const distance = Math.abs(a * position.x + b * position.y + c) / 
                  Math.sqrt(a * a + b * b);

              // Consider it a hit if within 20 pixels of the line
              return distance < 20;
          });

          if (edgeToDelete) {
              setEdges(edges => edges.filter(e => e.id !== edgeToDelete.id));
              return;
          }

          return;
      }

        if (type === 'Product') {
            const queueNode = nodes.find(node => {
                if (node.type !== 'Queue') return false;
                return (
                    position.x >= node.position.x &&
                    position.x <= node.position.x + 90 &&
                    position.y >= node.position.y &&
                    position.y <= node.position.y + node.data.products.length * 20 + 50
                );
            });

            if (queueNode) {
                setNodes(nds => nds.map(node => {
                    if (node.id === queueNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                products: [...node.data.products, { color: '#e0e0e0' }],
                                onProductUpdate: (nodeId, updatedProducts) => {
                                    setNodes(nodes => nodes.map(n => 
                                        n.id === nodeId ? { ...n, data: { ...n.data, products: updatedProducts }} : n
                                    ));
                                }
                            }
                        };
                    }
                    return node;
                }));
                return;
            }
            return;
        }

        const newNode = {
            id: getId(),
            type,
            position,
            data: { 
                label: `${type}`, 
                products: [],
                onProductUpdate: (nodeId, updatedProducts) => {
                    setNodes(nodes => nodes.map(n => 
                        n.id === nodeId ? { ...n, data: { ...n.data, products: updatedProducts }} : n
                    ));
                }
            },
        };

        setNodes(nds => [...nds, newNode]);
    },
    [nodes, type, screenToFlowPosition]
  );
      
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    id.current = 0;
  };

  const updateNodes = (message) => {
    console.log(message)
    setNodes((n) => {
      const newNodes = n.map((node) => {
        if (message.fromId === parseInt(node.id.replace('dndnode_', ''))) {
          const updatedNode = { ...node }
          updatedNode.data.products.shift()
          return updatedNode;
        }
        else if (message.toId === parseInt(node.id.replace('dndnode_', ''))) {
          const updatedNode = { ...node }
          updatedNode.data.products.push(message.product)
          return updatedNode;
        }
        return node;
      });
      return newNodes;
    });
  }

  const clearProducts = () => {
    setNodes((n) => {
      const newNodes = n.map((node) => {
        const updatedNode = { ...node }
        updatedNode.data.products = []
        return updatedNode;
      });
      return newNodes;
    });
  }

  useEffect(() => {
    graphDTORef.current = new GraphDTO()
    socketHandler.current = new SocketHandler(updateNodes, graphDTORef.current)
    return () => {
    };
  }, []);
  
  // Save/load functionality
const saveGraph = (nodes, edges) => {
  // Create a deep copy of nodes and clear products
  const nodesToSave = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      products: [] // Clear products array while keeping other data intact
    }
  }));

  return {
    nodes: nodesToSave,
    edges: edges,
    lastNodeId: id.current // Save the current ID counter
  };
};

const loadGraph = (graphData, setNodes, setEdges, idRef) => {
  // Restore nodes with the onProductUpdate function
  const loadedNodes = graphData.nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onProductUpdate: (nodeId, updatedProducts) => {
        setNodes(nodes => nodes.map(n => 
          n.id === nodeId ? { ...n, data: { ...n.data, products: updatedProducts }} : n
        ));
      }
    }
  }));

  setNodes(loadedNodes);
  setEdges(graphData.edges);
  idRef.current = graphData.lastNodeId; // Restore the ID counter
};

const saveFileToLocal = async (nodes, edges) => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'simulation.json',
      types: [{
        description: 'JSON Files',
        accept: {
          'application/json': ['.json']
        }
      }]
    });

    const graphData = saveGraph(nodes, edges);
    const content = JSON.stringify(graphData, null, 2);
    
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();

    console.log('Simulation saved successfully!');
  } catch (err) {
    console.error('File save canceled or failed', err);
  }
};

const loadFileFromLocal = async (setNodes, setEdges, idRef) => {
  try {
    handleClear() 
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON Files',
        accept: {
          'application/json': ['.json']
        }
      }]
    });

    const file = await handle.getFile();
    const content = await file.text();
    const graphData = JSON.parse(content);
    
    loadGraph(graphData, setNodes, setEdges, idRef);
    console.log('Simulation loaded successfully!');
  } catch (err) {
    console.error('File load canceled or failed', err);
  }
};

  return (
    <div className="app-with-above-buttons">
      <div className="number-button">
        <button onClick={() => {setItemsNumber((i) => {return i-1})}}>-</button>
        <p>{itemsNumber}</p>
        <button onClick={() => {setItemsNumber((i) => {return i+1})}}>+</button>
      </div>

      <div className="app">
        <div className="sidebar">
          <h3>Simulate Factory</h3>
          <div
            className="button"
            onDragStart={(event) => onDragStart(event, 'Machine')}
            draggable
          >
            <img src="src/assets/pics/engineering.png" alt="Machine" />
            Machine
          </div>
          <div
            className="button"
            onDragStart={(event) => onDragStart(event, 'Queue')}
            draggable
          >
            <img src="src/assets/pics/queue (1).png" alt="Queue" />
            Queue
          </div>
          <div
            className="button"
            onDragStart={(event) => onDragStart(event, 'Product')}
            draggable
          >
            <img src="src/assets/pics/product.png" alt="Queue" />
            product
          </div>
          <div
            className="button"
            onDragStart={(event) => onDragStart(event, 'Delete')}
            draggable
          >
            <img src="src/assets/pics/xIcon.png" alt="Queue" />
            Delete
          </div>
          <h2>Process</h2>
          <div className="button" onClick={() => {
            clearProducts()
            startAnimation()
            graphDTORef.current.build(nodes, edges, itemsNumber)
            socketHandler.current.startSimulation()
          }}>
            <img src="src/assets/pics/play-button.png" alt="Simulate" />
            Simulate
          </div>
          <div className="button" onClick={() => {
            clearProducts()
            socketHandler.current.replaySimulation()
          }}>
            <img src="src/assets/pics/refresh.png" alt="Replay" />
            Replay
          </div>
          <div className="button" onClick={() => {socketHandler.current.resumeSimulation()}}>
            <img src="src/assets/pics/play (2).png" alt="Resume" />
            Resume
          </div>
          <div className="button" onClick={() => {socketHandler.current.pauseSimulation()}}>
            <img src="src/assets/pics/stop.png" alt="Stop" />
            Pause
          </div>
          <div className="button" onClick={handleClear}>
            <img src="src/assets/pics/cleaning.png" alt="Clear" />
            Clear
          </div>
          <div className="button" onClick={() => saveFileToLocal(nodes, edges)}>
          <img src="src/assets/pics/save.png" alt="Save" />
          Save
        </div>
        <div className="button" onClick={() => loadFileFromLocal(setNodes, setEdges, id)}>
          <img src="src/assets/pics/load.png" alt="Load" />
          Load
        </div>

        </div>

        <div className="react-flow">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            attributionPosition="bottom-left"
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Controls />
            <Background color="#222" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default App;