import { Handle, Position } from '@xyflow/react';

const Machine = ({ data, shape = 'circle' }) => {
    const styles = {
        circle: {
            width: 100,
            height: 100,
            borderRadius: '50%',
        },
        rectangle: {
            width: 120,
            height: 80,
            borderRadius: 5,
        },
    };

    return (
        <div
            style={{
                ...styles[shape],
                background: '#f5f5f5',
                border: `2px solid ${data.color || '#333'}`, // Dynamic border color
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease', // Smooth animation
                cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'; // Scale effect on hover
                e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
        >
            <p style={{ 
                margin: 0, 
                fontWeight: 'bold', 
                color: data.textColor || '#000', // Dynamic text color
                fontFamily: 'Arial, sans-serif',
            }}>
                {data.label}
            </p>
            <Handle
                type="source"
                position={Position.Right}
                id="source-right"
                style={{
                    background: '#555',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
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
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                }}
            />
        </div>
    );
};

export default Machine;
