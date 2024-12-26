import { Handle, Position } from '@xyflow/react';

const Queue = ({ data }) => {
    
    return (
        <div
            style={{
                border: '2px solid #333',
                borderRadius: 5,
                background: '#f5f5f5',
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                width: 90,
                height: 90,
            }}
        >
            <p style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: 12, color: '#333' }}>
                {data.label || 'Queue'}
            </p>

            {/* Rectangle containing the image and counter */}
            <div
                style={{
                    width: 70,
                    height: 70,
                    background: '#e0e0e0',
                    border: '1px solid #999',
                    borderRadius: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Placeholder for image */}
                <img
                    src="src/assets/pics/queue (1).png"
                    style={{ width: 50, height: 50 }}
                />
                {/* Counter */}
                <div
                    style={{
                        marginTop: 5,
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: '#333',
                    }}
                >
                    Items: {data.items}
                </div>
            </div>

            {/* Handles for connections */}
            <Handle
                type="source"
                position={Position.Right}
                id="source-right"
                style={{
                    background: '#555',
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target-left"
                style={{
                    background: '#555',
                    top: '50%',
                    transform: 'translateY(-50%)',
                }}
            />
        </div>
    );
};

export default Queue;