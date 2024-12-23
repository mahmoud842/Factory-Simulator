import { Handle, Position } from '@xyflow/react';

const Queue = ({ data }) => {
    return (
        <div style={{ padding: 10, border: '1px solid #333', borderRadius: 5, background: '#f5f5f5' }}>
            <p>{data.label}</p>
            {/* Handle for source connections (right side) */}
            <Handle type="source" position={Position.Right} id="source-right" style={{ background: '#555' }} />
            {/* Handle for target connections (left side) */}
            <Handle type="target" position={Position.Left} id="target-left" style={{ background: '#555' }} />
        </div>
    );
};

export default Queue;