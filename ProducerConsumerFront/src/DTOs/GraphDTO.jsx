class GraphDTO {
    constructor() {
        this.machines = []
        this.queues = []
        this.itemsNumber = 10;
    }

    build(nodes, edges, itemsNumber) {
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

        this.machines = machines
        this.queues = queuesArray
        this.itemsNumber = itemsNumber
    }
}

export default GraphDTO;