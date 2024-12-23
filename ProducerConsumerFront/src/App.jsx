import { useState, useCallback ,useRef} from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDnD} from './ContextDnD';
import Machine from './Machine'
import Queue from './Queue';
import './App.css';


function App() {

  const appNodes = [];
  const appEdges = [];
  const [nodes, setNodes] = useState(appNodes);
  const [edges, setEdges] = useState(appEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [type, setType] = useDnD();
  const [count, setCount] = useState(0);
  const id = useRef(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);


  const getId = () => `dndnode_${id.current++}`;

  const nodeTypes = {
    Machine: Machine,
    Queue: Queue
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
    (params) => setEdges((eds) => addEdge(params, eds)),
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
      
      console.log("Drop event triggered"+ nodes);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: {  label: `${type}`},
      };
      console.log("Dragging", newNode.id);

      setNodes((nds) => [...nds, newNode]);
    },

    [screenToFlowPosition, type]

  );


  const handleSimulate = () => {
    console.log('Simulate clicked');
  };

  const handleResume = () => {
    console.log('Resume clicked');
  };

  const handleStop = () => {
    console.log('Stop clicked');
  };

  const handleClear = () => {
    console.log('Clear clicked');
    setNodes([]);
    setEdges([]);
    id.current = 0;
  };

  const onDragStart = (event, nodeType) => {
    console.log("Dragging", nodeType);
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
            <div className="app-with-above-buttons">
              <div className="number-button">
                <button onClick={decrement}>-</button>
                <p>Number Of Items <div>{count}</div></p>
                
                <button onClick={increment}>+</button>
              </div>

              <div className="app">

                    <div className="sidebar">
                          <p>Simulate Factory</p>
                          <div
                            className="button"
                            onDragStart={(event) => onDragStart(event, 'Machine')}
                            draggable
                          >
                            <img src="src/assets/pics/engineering.png" />
                            Machine
                          </div>
                          <div
                            className="button"
                            onDragStart={(event) => onDragStart(event, 'Queue')}
                            draggable
                          >
                            <img src="src/assets/pics/queue.png" />
                            Queue
                          </div>
                          <div className="button">
                            <img src="src/assets/pics/link.png" />
                            Link
                          </div>
                          <hr />
                          <div className="button" onClick={handleSimulate}>
                            <img src="src/assets/pics/play-button.png" />
                            Simulate
                          </div>
                          <div className="button" onClick={handleResume}>
                            <img src="src/assets/pics/play (1).png" />
                            Resume
                          </div>
                          <div className="button" onClick={handleStop}>
                            <img src="src/assets/pics/stop.png" />
                            Stop
                          </div>
                          <div className="button" onClick={handleClear}>
                            <img src="src/assets/pics/cleaning.png" />
                            Clear
                          </div>
                    </div>
                
                    <div className="react-flow">
                          <ReactFlow
                            nodes={nodes}
                            onNodesChange={onNodesChange}
                            edges={edges}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            attributionPosition="bottom-left"
                            nodeTypes={nodeTypes}
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


