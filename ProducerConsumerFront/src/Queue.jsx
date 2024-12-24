import { Handle, Position } from '@xyflow/react';

const Queue = ({ data }) => {
    // Generate mock queue items for visual representation
    const queueItems = data.items || ['Item 1', 'Item 2', 'Item 3'];

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
            }}
        >
            <p style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: 12, color: '#333' }}>
                {data.label || 'Queue'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {queueItems.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            width: 80,
                            height: 20,
                            background: '#e0e0e0',
                            border: '1px solid #999',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: '#333',
                        }}
                    >
                        {item}
                    </div>
                ))}
            </div>

            {/* Multiple Handles for connections */}
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
