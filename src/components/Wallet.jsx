import React, { useState } from 'react';
import Web3 from 'web3';
import CoinSelector from './CoinSelector';
import AccountDetails from './AccountDetails';
import PrivateKeyInput from './PrivateKeyInput';
import TransactionForm from './TransactionForm';
import TransactionHistory from './TransactionHistory';

const Wallet = () => {
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState('');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [coin, setCoin] = useState('ETH');
    const [privateKey, setPrivateKey] = useState('');
    const [transactionHistory, setTransactionHistory] = useState([]);
    const infuraApiKey = '3702a82af21047dfaa2977ff0663f477';
    const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraApiKey}`);

    const createAccount = () => {
        const newAccount = web3.eth.accounts.create();
        setAccount(newAccount.address);
    };

    const restoreAccount = () => {
        const restoredAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
        setAccount(restoredAccount.address);
    };

    const getBalance = async () => {
        if (coin === 'ETH') {
            const balanceWei = await web3.eth.getBalance(account);
            const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
            setBalance(balanceEth);
        } else if (coin === 'BTC') {
            // BTC balance retrieval would typically require a third-party API, which is not implemented here
            setBalance('BTC balance retrieval not implemented');
        }
    };

    const sendTransaction = async () => {
        if (coin === 'ETH') {
            const transaction = {
                from: account,
                to: recipient,
                value: web3.utils.toWei(amount, 'ether'),
                gas: 2000000,
            };

            const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
            web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                .on('receipt', (receipt) => {
                    console.log(receipt);
                    setTransactionHistory([...transactionHistory, receipt]);
                });
        } else if (coin === 'BTC') {
            // BTC transaction handling would typically require a third-party API, which is not implemented here
            console.log('BTC transaction sending not implemented');
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow-md w-full max-w-sm">
            <h1 className="text-xl font-bold mb-4">HD Wallet</h1>
            <CoinSelector coin={coin} setCoin={setCoin} />
            <button onClick={createAccount} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Create Account</button>
            <PrivateKeyInput privateKey={privateKey} setPrivateKey={setPrivateKey} restoreAccount={restoreAccount} />
            <button onClick={getBalance} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">Check Balance</button>
            <AccountDetails account={account} balance={balance} coin={coin} />
            <TransactionForm recipient={recipient} setRecipient={setRecipient} amount={amount} setAmount={setAmount} sendTransaction={sendTransaction} />
            <TransactionHistory transactionHistory={transactionHistory} web3={web3} />
        </div>
    );
};

export default Wallet;
