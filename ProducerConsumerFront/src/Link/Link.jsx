import React from 'react';
import './Link.css'; // Import the CSS file for styles

const Link = ({ id, sourceX, sourceY, targetX, targetY }) => {
    // Straight line path
    const path = `M${sourceX},${sourceY} L${targetX},${targetY}`; // Straight line from source to target

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
                className="link-path"
                markerEnd="url(#arrowhead)" // Use the arrowhead marker
            />
        </>
    );
};

export default Link;
