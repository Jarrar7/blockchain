import React, { useState } from 'react';
import Web3 from 'web3';
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from 'bip39';
import { hdkey } from 'ethereumjs-wallet'; // Correct import path
import CoinSelector from './CoinSelector';
import AccountDetails from './AccountDetails';
import PrivateKeyInput from './PrivateKeyInput';
import TransactionForm from './TransactionForm';
import TransactionHistory from './TransactionHistory';

const Wallet = () => {
    const [mnemonic, setMnemonic] = useState('');
    const [account, setAccount] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [balance, setBalance] = useState('');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [coin, setCoin] = useState('ETH');
    const [transactionHistory, setTransactionHistory] = useState([]);
    const infuraApiKey = '3702a82af21047dfaa2977ff0663f477';
    const web3 = new Web3(`https://sepolia.infura.io/v3/${infuraApiKey}`);

    const createHDWallet = async () => {
        const mnemonic = generateMnemonic();
        const seed = await mnemonicToSeed(mnemonic);
        const hdWallet = hdkey.fromMasterSeed(seed);
        const derivedNode = hdWallet.derivePath("m/44'/60'/0'/0/0");
        const newAccount = derivedNode.getWallet();
        const address = `0x${newAccount.getAddress().toString('hex')}`;
        const privateKey = `0x${newAccount.getPrivateKey().toString('hex')}`;

        setMnemonic(mnemonic);
        setAccount(address);
        setPrivateKey(privateKey);
        console.log('New HD Account:', { address, privateKey, mnemonic });
    };

    const restoreHDWallet = async (mnemonic) => {
        try {
            if (!validateMnemonic(mnemonic)) {
                throw new Error('Invalid mnemonic phrase');
            }
            const seed = await mnemonicToSeed(mnemonic);
            const hdWallet = hdkey.fromMasterSeed(seed);
            const derivedNode = hdWallet.derivePath("m/44'/60'/0'/0/0");
            const restoredAccount = derivedNode.getWallet();
            const address = `0x${restoredAccount.getAddress().toString('hex')}`;
            const privateKey = `0x${restoredAccount.getPrivateKey().toString('hex')}`;

            setAccount(address);
            setPrivateKey(privateKey);
            setMnemonic(mnemonic);
        } catch (error) {
            console.error('Error restoring HD wallet:', error);
        }
    };

    const getBalance = async () => {
        if (coin === 'ETH') {
            const balanceWei = await web3.eth.getBalance(account);
            const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
            setBalance(balanceEth);
        } else if (coin === 'BTC') {
            setBalance('BTC balance retrieval not implemented');
        }
    };

    const sendTransaction = async () => {
        if (coin === 'ETH') {
            try {
                let formattedRecipient = recipient.trim();
                if (!formattedRecipient.startsWith('0x')) {
                    formattedRecipient = '0x' + formattedRecipient;
                }
                if (formattedRecipient.length !== 42) {
                    throw new Error('Invalid recipient address length');
                }

                const gasLimit = await web3.eth.estimateGas({
                    from: account,
                    to: formattedRecipient,
                    value: web3.utils.toWei(amount, 'ether'),
                });

                const currentGasPrice = await web3.eth.getGasPrice();
                const gasPrice = web3.utils.toBN(currentGasPrice).mul(web3.utils.toBN(110)).div(web3.utils.toBN(100)).toString();

                const transaction = {
                    from: account,
                    to: formattedRecipient,
                    value: web3.utils.toWei(amount, 'ether'),
                    gas: gasLimit,
                    gasPrice: gasPrice,
                };

                let formattedPrivateKey = privateKey.trim();
                if (!formattedPrivateKey.startsWith('0x')) {
                    formattedPrivateKey = '0x' + formattedPrivateKey;
                }
                if (formattedPrivateKey.length !== 66) {
                    throw new Error('Invalid private key length');
                }

                const signedTransaction = await web3.eth.accounts.signTransaction(transaction, formattedPrivateKey);
                web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                    .on('receipt', (receipt) => {
                        console.log(receipt);
                        setTransactionHistory([...transactionHistory, receipt]);
                    });
            } catch (error) {
                console.error('Error sending transaction:', error);
            }
        } else if (coin === 'BTC') {
            console.log('BTC transaction sending not implemented');
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow-md w-full max-w-sm">
            <h1 className="text-xl font-bold mb-4">HD Wallet</h1>
            <CoinSelector coin={coin} setCoin={setCoin} />
            <button onClick={createHDWallet} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Create HD Wallet</button>
            {mnemonic && (
                <div className="mb-4">
                    <label className="block text-gray-700">Mnemonic (keep this secure!):</label>
                    <textarea
                        value={mnemonic}
                        readOnly
                        className="mt-1 p-2 border rounded w-full"
                        rows="4"
                    />
                </div>
            )}
            {privateKey && (
                <div className="mb-4">
                    <label className="block text-gray-700">Private Key (keep this secure!):</label>
                    <textarea
                        value={privateKey}
                        readOnly
                        className="mt-1 p-2 border rounded w-full"
                        rows="4"
                    />
                </div>
            )}
            <PrivateKeyInput privateKey={privateKey} setPrivateKey={setPrivateKey} restoreAccount={() => restoreHDWallet(mnemonic)} />
            <button onClick={getBalance} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">Check Balance</button>
            <AccountDetails account={account} balance={balance} coin={coin} />
            <TransactionForm recipient={recipient} setRecipient={setRecipient} amount={amount} setAmount={setAmount} sendTransaction={sendTransaction} />
            <TransactionHistory transactionHistory={transactionHistory} web3={web3} />
        </div>
    );
};

export default Wallet;
