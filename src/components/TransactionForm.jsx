import React from 'react';

const TransactionForm = ({ recipient, setRecipient, amount, setAmount, sendTransaction }) => {
    return (
        <div className="mt-4">
            <input
                type="text"
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="mb-2 p-2 border rounded w-full"
            />
            <input
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mb-2 p-2 border rounded w-full"
            />
            <button onClick={sendTransaction} className="px-4 py-2 bg-purple-500 text-white rounded">Send Transaction</button>
        </div>
    );
};

export default TransactionForm;
