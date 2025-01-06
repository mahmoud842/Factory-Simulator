export function saveGraph(nodes, edges, id) {
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
}

export function loadGraph(graphData, setNodes, setEdges, idRef, handleClear) {
    handleClear()
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
}

export async function saveFileToLocal(nodes, edges, id) {
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

        const graphData = saveGraph(nodes, edges, id);
        const content = JSON.stringify(graphData, null, 2);
        
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();

        console.log('Simulation saved successfully!');
    } catch (err) {
        console.error('File save canceled or failed', err);
    }
}

export async function loadFileFromLocal (setNodes, setEdges, idRef, handleClear) {
    try {
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
        loadGraph(graphData, setNodes, setEdges, idRef, handleClear);
        console.log('Simulation loaded successfully!');
    } catch (err) {
        console.error('File load canceled or failed', err);
    }
}