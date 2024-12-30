import { useState, useCallback, useRef ,useEffect} from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDnD } from './ContextDnD';
import Machine from './Machine';
import Queue from './Queue';
import Link from './Link';
import Productt from './Productt'
import './App.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type, setType] = useDnD();
  const intervalId = useRef(null);

  const id = useRef(0);

  const getId = () =>` dndnode_${id.current++}`;

  const nodeTypes = {
    Machine,
    Queue,
    Productt,
  };
  
  const edgeTypes = {
    Link,
  };

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

        if (type === 'Productt') {
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
      
console.log(nodes)
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    id.current = 0;
  };
  
  const onDragStart = (event, nodeType) => {
    
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const builder = (nodes, edges) => {
      const machines = [];
      const queues = new Set();

      edges.forEach(edge => {
          const targetNode = nodes.find(n => n.id === edge.target);
          const sourceNode = nodes.find(n => n.id === edge.source);
          
          if (targetNode?.type === 'Queue') {
              queues.add(parseInt(edge.target.replace('dndnode_', '')));
          }
          if (sourceNode?.type === 'Queue') {
              queues.add(parseInt(edge.source.replace('dndnode_', '')));
          }
      });

      nodes.forEach(node => {
          if (node.type === 'Machine') {
              const machineId = parseInt(node.id.replace('dndnode_', ''));
              
              const outputEdge = edges.find(edge => edge.source === node.id);
              const outputQueueId = outputEdge ? parseInt(outputEdge.target.replace('dndnode_', '')) : null;
              
              const inputEdges = edges.filter(edge => edge.target === node.id);
              const inputQueueIds = inputEdges.map(edge => parseInt(edge.source.replace('dndnode_', '')));

              machines.push({
                  id: machineId,
                  outputQueueId: outputQueueId,
                  inputQueueIds: inputQueueIds,
                  products: node.data.products.map(p => ({ color: p.color || '#e0e0e0' }))
              });
          }
      });

      const queuesArray = Array.from(queues).map(queueId => ({
          id: queueId,
          products: nodes.find(n => n.id === ` dndnode_${queueId}`)?.data.products.map(p => ({ color: p.color || '#e0e0e0' })) || []
      }));

      return {
          machines: machines,
          queues: queuesArray,
          itemsNumber: 10
      };
  };


  const handleSimulation = async () => {
    // Set Graph
    try {
      const response = await fetch('http://localhost:8080/setGraph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(builder(nodes,edges))
      });
      
      if (response.ok) {
        // Start Simulation
        const startResponse = await fetch('http://localhost:8080/startSimulation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (startResponse.ok) {
          intervalId.current = setInterval(getGraph, 10);
        }
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

    const getGraph = async () => {
    try {
      const response = await fetch('http://localhost:8080/getState', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);

        setNodes(nodes => nodes.map(node => {
          if (node.type === 'Queue') {
            const queueData = result.queues.find(
              q => q.id === parseInt(node.id.replace('dndnode_', ''))
            );
            if (queueData) {
              return {
                ...node,
                data: {
                  ...node.data,
                  products: queueData.products
                }
              };
            }
          }
          if (node.type === 'Machine') {
            const machineData = result.machines.find(
              m => m.id === parseInt(node.id.replace('dndnode_', ''))
            );
            if (machineData) {
              return {
                ...node,
                data: {
                  ...node.data,
                  products: machineData.products
                }
              };
            }
          }
          return node;
        }));

        if (result.itemsNumber === 0) {
          clearInterval(intervalId.current);
        }
        
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handlePause = async () => {
    try {
      const response = await fetch('http://localhost:8080/pauseSimulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        clearInterval(intervalId.current);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleResume = async () => {
    try {
      const response = await fetch('http://localhost:8080/resumeSimulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        intervalId.current = setInterval(getGraph, 500);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);
  

  return (
    <div className="app-with-above-buttons">
      <div className="number-button">
        <button>-</button>
        <button>+</button>
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
            onDragStart={(event) => onDragStart(event, 'Productt')}
            draggable
          >
            <img src="src/assets/pics/product.png" alt="Queue" />
            product
          </div>
          <h2>Process</h2>
          <div className="button" onClick={handleSimulation}>
            <img src="src/assets/pics/play-button.png" alt="Simulate" />
            Simulate
          </div>
          <div className="button" >
            <img src="src/assets/pics/refresh.png" alt="Resume" />
            Replay
          </div>
          <div className="button" onClick={handleResume}>
            <img src="src/assets/pics/play (2).png" alt="Resume" />
            Resume
          </div>
          <div className="button" onClick={handlePause}>
            <img src="src/assets/pics/stop.png" alt="Stop" />
            Pause
          </div>
          <div className="button" onClick={handleClear}>
            <img src="src/assets/pics/cleaning.png" alt="Clear" />
            Clear
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