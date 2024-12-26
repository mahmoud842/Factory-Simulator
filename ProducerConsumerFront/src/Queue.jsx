import { Handle, Position } from '@xyflow/react';

const Queue = ({ data, id }) => {
    const updateProductColor = (index, newColor) => {
        const updatedProducts = data.products.map((product, i) => 
            i === index ? { ...product, color: newColor } : product
        );
        // Trigger node data update through React Flow
        if (data.onProductUpdate) {
            data.onProductUpdate(id, updatedProducts);
        }
    };
    
    return (
        <div style={{
            border: '2px solid #333',
            borderRadius: 5,
            background: '#f5f5f5',
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            width: 90,
            minHeight: 50,
            height: Math.max(50, 30 + data.products.length * 20)
        }}>
            <p style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: 12, color: '#333' }}>
                {data.label || 'Queue'}
            </p>

            <div style={{
                width: 70,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                alignItems: 'center'
            }}>
                {data.products.map((product, index) => (
                    <div key={index} style={{
                        width: '100%',
                        height: 15,
                        background: product.color || '#e0e0e0',
                        border: '1px solid #333',
                        borderRadius: 3,
                        padding: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: 8, marginLeft: 2 }}>Product</span>
                        <input
                            type="color"
                            value={product.color}
                            onChange={(e) => updateProductColor(index, e.target.value)}
                            style={{
                                width: 12,
                                height: 12,
                                padding: 0,
                                border: 'none'
                            }}
                        />
                    </div>
                ))}
            </div>

            <Handle type="source" position={Position.Right} style={{ background: '#555', top: '50%' }} />
            <Handle type="target" position={Position.Left} style={{ background: '#555', top: '50%' }} />
        </div>
    );
};

export default Queue;