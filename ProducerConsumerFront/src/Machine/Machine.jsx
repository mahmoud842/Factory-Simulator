import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import './Machine.css'; // Import the CSS file

const Machine = ({ data }) => {
    // const [backgroundColor, setBackgroundColor] = useState('#f5f5f5')

    // useEffect(() => {
    //     console.log('color changed')
    //     setBackgroundColor()
    // }, [data.products])

    return (
        <div
            className='machine'
            style={{
                background: data.products.length > 0 ? data.products[0].color : '#f5f5f5',
                borderColor: '#333',
            }}
        >
            <p
                className="machine-label"
                style={{
                    color: '#000',
                }}
            >
                {data.label}
            </p>
            <Handle
                type="source"
                position={Position.Right}
                id="source-right"
                className="machine-handle"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target-left"
                className="machine-handle"
            />
        </div>
    );
};

export default Machine;
