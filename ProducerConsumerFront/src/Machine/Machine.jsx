import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FaCog } from 'react-icons/fa'; // Gear icon from react-icons
import './Machine.css'; // Import the CSS file

const Machine = ({ data}) => {
    const [isRolling, setIsRolling] = useState(true);

    useEffect(() => {
        console.log(data.products.length > 0)
        setIsRolling(data.products.length > 0); 
    }, [data.products]);

    return (
        <div
            className='machine'
            style={{
                background: data.products.length > 0 ? data.products[0].color : '#f5f5f5',
                borderColor: '#333',
            }}
        >
            <div className={`gear-icon small-gear ${isRolling ? 'rolling' : ''}`}>
                <FaCog size={20} /> 
            </div>
            <div className={`gear-icon big-gear ${isRolling ? 'rolling' : ''}`}>
                <FaCog size={32} />
            </div>
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
