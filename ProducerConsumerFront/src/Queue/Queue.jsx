import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './Queue.css'; // Import the CSS file

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
        <div className="queue">
            <p className="queue-label">{data.label || 'Queue'}</p>

            {/* Scrollable container for products */}
            <div className="queue-products">
                {data.products.map((product, index) => (
                    <div
                        key={index}
                        className="queue-product"
                        style={{ background: product.color || '#e0e0e0' }}
                    >
                    </div>
                ))}
            </div>

            <Handle type="source" position={Position.Right} className="queue-handle" />
            <Handle type="target" position={Position.Left} className="queue-handle" />
        </div>
    );
};

export default Queue;
