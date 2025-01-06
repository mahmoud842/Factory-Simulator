import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { DnDProvider} from './ContextDnD';

import { ReactFlowProvider } from '@xyflow/react';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ReactFlowProvider>
      <DnDProvider>
      <App />
      </DnDProvider>
    </ReactFlowProvider>
  // </StrictMode>
);
