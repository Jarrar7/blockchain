import React from 'react';

const AccountDetails = ({ account, balance, coin }) => {
    return (
        <div>
            <p>Account: {account}</p>
            <p>Balance: {balance} {coin}</p>
        </div>
    );
};

export default AccountDetails;
