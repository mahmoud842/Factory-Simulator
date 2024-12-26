import  { useState,useRef } from 'react';
import { Handle, Position } from '@xyflow/react';

const Productt = ({ data }) => {
    const [color, setColor] = useState('#e0e0e0');
    const colorPickerRef = useRef(null);

    const handleColorChange = (e) => {
        setColor(e.target.value);
    };
    const handleImageClick = () => {
        if (colorPickerRef.current) {
            colorPickerRef.current.click(); // Programmatically click the hidden input
        }
    };

    return (
        <div
            style={{
                border: '2px solid #333',
                borderRadius: 5,
                background:color,
                padding: 8,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                position: 'relative',
                width: 40,
                height: 5, // Adjusted height for the color picker
            }}
        >
            <p style={{ margin: '3px 0 2px', fontWeight: 'bold', fontSize: 8, color: '#333' }}>
                {data.label || 'Product'}
            </p>
            
               
            
            <input
                type="color"
                value={color}
                onChange={handleColorChange}
                ref={colorPickerRef} // Attach ref to the input
                style={{ display: 'none' }} // Hide the input
            />
            {/* Image that triggers the color picker */}
            <img
                src="src/assets/pics/color.png"
                alt="Color Picker Icon"
                onClick={handleImageClick} // Trigger color picker on click
                style={{
                    width: 10,
                    height:10,
                    cursor: 'pointer',
                    marginTop: 1.5,
                    marginLeft:5,
                }}
            />


          
        </div>
    );
};

export default Productt;
