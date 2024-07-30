import React from 'react';

const TransactionHistory = ({ transactionHistory, web3 }) => {
    return (
        <div>
            <h2 className="text-lg font-bold">Transaction History</h2>
            {transactionHistory.length > 0 ? (
                <ul className="list-disc pl-5">
                    {transactionHistory.map((tx, index) => (
                        <li key={index}>
                            <p>Hash: {tx.transactionHash}</p>
                            <p>Block: {tx.blockNumber}</p>
                            <p>From: {tx.from}</p>
                            <p>To: {tx.to}</p>
                            <p>Value: {web3.utils.fromWei(tx.value.toString(), 'ether')} ETH</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No transactions yet</p>
            )}
        </div>
    );
};

export default TransactionHistory;
