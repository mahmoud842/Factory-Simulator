import { createContext, useState,useContext } from 'react';
import PropTypes from 'prop-types';

const ContextDnD = createContext([null, () => {}]);

export const DnDProvider = ({ children }) => {
    const [type, setType] = useState(null);

return (
    <ContextDnD.Provider value={[type, setType]}>
        {children}
    </ContextDnD.Provider>
);
};

DnDProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ContextDnD;

// eslint-disable-next-line react-refresh/only-export-components
export const useDnD = () => {
    return useContext(ContextDnD);
};

