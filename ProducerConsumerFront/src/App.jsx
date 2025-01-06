import { useState, useCallback, useRef ,useEffect,useMemo } from 'react';
import { saveGraph, saveFileToLocal, loadFileFromLocal, loadGraph } from './SaveAndLoad.jsx'
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from '@xyflow/react';
import { throttle } from 'lodash';
import '@xyflow/react/dist/style.css';
import { Snackbar, Alert } from '@mui/material';
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
  const [simulationStatus, setSimulationStatus] = useState({
    running: false,
    pause: false
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' // can be 'error', 'warning', 'info', or 'success'
  });


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
    Machine: (props) => <Machine {...props}  />,
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
    if (simulationStatus.running) return;
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const onDragOver = useCallback((event) => {
    if (simulationStatus.running) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
        if (simulationStatus.running) return;
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
    if (simulationStatus.running) return;
    setNodes([]);
    setEdges([]);
    id.current = 0;
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const updateNodes = throttle((message) => {
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
  }, 20)

  const clearProducts = () => {
    if (simulationStatus.running) return;
    setNodes((n) => {
      const newNodes = n.map((node) => {
        const updatedNode = { ...node }
        updatedNode.data.products = []
        return updatedNode;
      });
      return newNodes;
    });
  }

  const handleSimulate = () => {
    setSimulationStatus({
      running: true,
      pause: false
    })
    startAnimation()
  }
  const handleReplay = () => {
    setSimulationStatus({
      running: true,
      pause: false
    })
    startAnimation()
  }
  const handlePause = () => {
    setSimulationStatus({
      running: true,
      pause: true
    })
    stopAnimation()
  }
  const handleResume = () => {
    setSimulationStatus({
      running: true,
      pause: false
    })
    startAnimation()
  }
  const handleEnd = () => {
    setSimulationStatus({
      running: false,
      pause: false
    })
    stopAnimation()
  }
  const handleMessage = (themessage) => {
    setSnackbar({
      open: true,
      message: themessage,
      severity: 'info'
    });
  }

  // useEffect(()=>{
  //   console.log(nodes)
  // }, [nodes])

  useEffect(() => {
    graphDTORef.current = new GraphDTO()
    socketHandler.current = new SocketHandler(
      updateNodes,
      graphDTORef.current,
      handleSimulate,
      handleReplay,
      handlePause,
      handleResume,
      handleEnd,
      handleMessage
    )
    return () => {
    };
  }, []);
  

  return (
    <div className="app-with-above-buttons">
      <div className="number-button">
        <button onClick={() => {setItemsNumber((i) => {return i == 1 ? i : i-1})}}>-</button>
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
            <img src="src/assets/pics/engineering.png" alt="Machine" style={{marginRight:'15px'}} />
            Machine
          </div>
          <div
            className="button"
            onDragStart={(event) => onDragStart(event, 'Queue')}
            draggable
          >
            <img src="src/assets/pics/queue (1).png" alt="Queue" style={{marginRight:'15px'}}/>
            Queue
          </div>
          <div
            className="button"
            onDragStart={(event) => onDragStart(event, 'Product')}
            draggable
          >
            <img src="src/assets/pics/product.png" alt="Queue"  style={{marginRight:'15px'}}/>
            product
          </div>
          <div
            className="button"
            onDragStart={(event) => onDragStart(event, 'Delete')}
            draggable
          >
            <img src="src/assets/pics/xIcon.png" alt="Queue"  style={{marginRight:'15px'}}/>
            Delete
          </div>
          <h2>Process</h2>
          <div className='status-btns'>
            {
              !simulationStatus.running && 
              <>
                <div className="status-button" onClick={() => {
                  clearProducts()
                  graphDTORef.current.build(nodes, edges, itemsNumber)
                  socketHandler.current.startSimulation()
                }}>
                  <img src="src/assets/pics/play.png" alt="Simulate" />
                </div>
                <div className="status-button" onClick={() => {
                  clearProducts()
                  socketHandler.current.replaySimulation()
                }}>
                  <img src="src/assets/pics/replay.png" alt="Replay" />
                </div>
              </>
            }
            {
              simulationStatus.running &&
              <>
                {
                  simulationStatus.pause &&
                  <div className="status-button" onClick={() => {socketHandler.current.resumeSimulation()}}>
                    <img src="src/assets/pics/play.png" alt="Resume" />
                  </div>
                }
                {
                  !simulationStatus.pause &&
                  <div className="status-button" onClick={() => {socketHandler.current.pauseSimulation()}}>
                    <img src="src/assets/pics/pause.png" alt="pause" />
                  </div>
                }
                <div className="status-button" onClick={() => {socketHandler.current.endSimulation()}}>
                  <img src="src/assets/pics/stop.png" alt="end" />
                </div>
              </>
            }
          </div>
          <div className='status-btns'>
            <div className="status-button" onClick={handleClear}>
              <img src="src/assets/pics/clear.png" alt="Clear" />
            </div>
            <div className="status-button" onClick={clearProducts}>
              <img src="src/assets/pics/clear-products.png" alt="Clear-products" />
            </div>
            <div className="status-button" onClick={() => saveFileToLocal(nodes, edges, id)}>
              <img src="src/assets/pics/save.png" alt="Save" />
            </div>
            <div className="status-button" onClick={() => loadFileFromLocal(setNodes, setEdges, id, handleClear)}>
              <img src="src/assets/pics/load.png" alt="Load" />
            </div>
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

        <Snackbar 
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
  );
}

export default App;