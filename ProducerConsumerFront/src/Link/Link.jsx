import React from 'react';
import './Link.css';
import { useState } from 'react';

const Link = ({ id, sourceX, sourceY, targetX, targetY, isAnimating, onStop }) => {
    const [dashOffset, setDashOffset] = useState(0);
    const path = `M${sourceX},${sourceY} L${targetX},${targetY}`;
    
    return (
        <>
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" className="arrowhead" />
                </marker>
            </defs>
            <path
                id={id}
                d={path}
                className={`link-path ${isAnimating ? 'animating' : ''}`}
                markerEnd="url(#arrowhead)"
            />
        </>
    );
};

export default Link;