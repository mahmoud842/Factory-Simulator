import { useState, useCallback, useRef } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDnD } from './ContextDnD';
import Machine from './Machine';
import Queue from './Queue';
import Link from './Link';
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

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type}` },
      };

      setNodes((nds) => {
        const updatedNodes = [...nds, newNode];
  
        // Filter nodes after updating
        const machineNodes = updatedNodes.filter((node) => node.type === 'Machine');
        const queueNodes = updatedNodes.filter((node) => node.type === 'Queue');
  
        console.log('Machine Nodes Array:', machineNodes);
        console.log('Queue Nodes Array:', queueNodes);
  
        return updatedNodes;
      });

    },
    [screenToFlowPosition, type]
  );

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    id.current = 0;
  };

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
          <h2>Process</h2>
          <div className="button" onClick={() => console.log('Simulate clicked')}>
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