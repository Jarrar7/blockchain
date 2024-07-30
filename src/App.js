import React from 'react';
import Wallet from './components/Wallet';
import { Buffer } from 'buffer';
window.Buffer = Buffer;


function App() {
  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Wallet />
      </div>
  );
}

export default App;
