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

  const onConnect = useCallback(
    (params) => {
      const newEdge = { ...params, type: 'Link' };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

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
  const [socket, setSocket] = useState(null);

const handleSimulation = async () => {
  try {
    const response = await fetch('http://localhost:8080/simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges })
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    
    // Start WebSocket connection
    const newSocket = new WebSocket('ws://localhost:8080/simulation-updates');
    
    newSocket.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setNodes(update)
      console.log('Simulation update:', update);
    };

    newSocket.onclose = () => {
      console.log('Simulation completed');
      setSocket(null);
    };

    setSocket(newSocket);

    const data = await response.json();
    console.log('Simulation started:', data);

  } catch (error) {
    console.error('Error:', error);
  }
};

// Cleanup on component unmount
useEffect(() => {
  return () => {
    if (socket) socket.close();
  };
}, [socket]);

  const onDragStart = (event, nodeType) => {
    
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  


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
          <div className="button" onClick={() => console.log('Resume clicked')}>
            <img src="src/assets/pics/refresh.png" alt="Resume" />
            Replay
          </div>
          <div className="button" onClick={() => console.log('Stop clicked')}>
            <img src="src/assets/pics/stop.png" alt="Stop" />
            Stop
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