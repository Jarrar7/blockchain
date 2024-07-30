import React from 'react';

const PrivateKeyInput = ({ privateKey, setPrivateKey, restoreAccount }) => {
    return (
        <div className="mb-4">
            <input
                type="text"
                placeholder="Private Key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="mb-2 p-2 border rounded w-full"
            />
            <button onClick={restoreAccount} className="px-4 py-2 bg-yellow-500 text-white rounded">Restore Account</button>
        </div>
    );
};

export default PrivateKeyInput;
