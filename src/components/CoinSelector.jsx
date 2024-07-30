import React from 'react';

const CoinSelector = ({ coin, setCoin }) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700">Select Coin</label>
            <select
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
            >
                <option value="ETH">Ethereum</option>
                <option value="BTC">Bitcoin</option>
            </select>
        </div>
    );
};

export default CoinSelector;
