const Link = ({ id, sourceX, sourceY, targetX, targetY, style }) => {
    // Define the edge style explicitly for a thin, solid straight line
    const edgeStyle = {
        stroke: 'green', // Set the color of the line
        strokeWidth: 2, // Set the line thickness
        fill: 'none', // Ensure no fill color for the path
    };

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
                    <polygon points="0 0, 10 3.5, 0 7" fill="green" />
                </marker>
            </defs>
            <path
                id={id}
                d={path}
                style={edgeStyle}
                markerEnd="url(#arrowhead)" // Use the arrowhead marker
            />
        </>
    );
};

export default Link;
