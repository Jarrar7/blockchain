import React, { useState } from 'react';
import Web3 from 'web3';
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import BigNumber from 'bignumber.js';

const Wallet = () => {
    const [mnemonic, setMnemonic] = useState('');
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState('');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [coin, setCoin] = useState('ETH');
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [mnemonicInput, setMnemonicInput] = useState('');
    const [derivedAddresses, setDerivedAddresses] = useState([]);
    const [signedTransaction, setSignedTransaction] = useState('');
    const infuraApiKey = '3702a82af21047dfaa2977ff0663f477';
    const web3 = new Web3(`https://sepolia.infura.io/v3/${infuraApiKey}`);

    const WBTC_CONTRACT_ADDRESS = '0x...'; // Replace with the actual WBTC contract address
    const WBTC_ABI = [ /* ABI array */ ]; // Replace with the actual WBTC ABI array

    const createHDWallet = async () => {
        const mnemonic = generateMnemonic();
        const seed = await mnemonicToSeed(mnemonic);
        const hdWallet = hdkey.fromMasterSeed(seed);
        const derivedNode = hdWallet.derivePath("m/44'/60'/0'/0/0");
        const newAccount = derivedNode.getWallet();
        const address = `0x${newAccount.getAddress().toString('hex')}`;

        setMnemonic(mnemonic);
        setAccount(address);
        console.log('New HD Account:', { address, mnemonic });
    };

    const restoreHDWallet = async () => {
        try {
            if (!validateMnemonic(mnemonicInput)) {
                throw new Error('Invalid mnemonic phrase');
            }
            const seed = await mnemonicToSeed(mnemonicInput);
            const hdWallet = hdkey.fromMasterSeed(seed);
            const derivedNode = hdWallet.derivePath("m/44'/60'/0'/0/0");
            const restoredAccount = derivedNode.getWallet();
            const address = `0x${restoredAccount.getAddress().toString('hex')}`;

            setAccount(address);
            setMnemonic(mnemonicInput);
        } catch (error) {
            console.error('Error restoring HD wallet:', error);
        }
    };

    const getPrivateKeyFromMnemonic = async (mnemonic, index = 0) => {
        const seed = await mnemonicToSeed(mnemonic);
        const hdWallet = hdkey.fromMasterSeed(seed);
        const derivedNode = hdWallet.derivePath(`m/44'/60'/0'/0/${index}`);
        const account = derivedNode.getWallet();
        return `0x${account.getPrivateKey().toString('hex')}`;
    };

    const getBalance = async () => {
        if (coin === 'ETH') {
            const balanceWei = await web3.eth.getBalance(account);
            const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
            setBalance(balanceEth);
        } else if (coin === 'WBTC') {
            const contract = new web3.eth.Contract(WBTC_ABI, WBTC_CONTRACT_ADDRESS);
            const balanceWei = await contract.methods.balanceOf(account).call();
            const balanceWBTC = web3.utils.fromWei(balanceWei, 'ether');
            setBalance(balanceWBTC);
        }
    };

    const sendTransaction = async () => {
        if (coin === 'ETH') {
            try {
                const privateKey = await getPrivateKeyFromMnemonic(mnemonic);
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
                const gasPrice = new BigNumber(currentGasPrice).multipliedBy(1.1).integerValue().toString();

                const transaction = {
                    from: account,
                    to: formattedRecipient,
                    value: web3.utils.toWei(amount, 'ether'),
                    gas: gasLimit,
                    gasPrice: gasPrice,
                };

                const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
                web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                    .on('receipt', (receipt) => {
                        console.log(receipt);
                        setTransactionHistory([...transactionHistory, receipt]);
                    });
            } catch (error) {
                console.error('Error sending transaction:', error);
            }
        } else if (coin === 'WBTC') {
            try {
                const privateKey = await getPrivateKeyFromMnemonic(mnemonic);
                let formattedRecipient = recipient.trim();
                if (!formattedRecipient.startsWith('0x')) {
                    formattedRecipient = '0x' + formattedRecipient;
                }
                if (formattedRecipient.length !== 42) {
                    throw new Error('Invalid recipient address length');
                }

                const contract = new web3.eth.Contract(WBTC_ABI, WBTC_CONTRACT_ADDRESS);
                const data = contract.methods.transfer(formattedRecipient, web3.utils.toWei(amount, 'ether')).encodeABI();

                const gasLimit = await web3.eth.estimateGas({
                    from: account,
                    to: WBTC_CONTRACT_ADDRESS,
                    data: data,
                });

                const currentGasPrice = await web3.eth.getGasPrice();
                const gasPrice = new BigNumber(currentGasPrice).multipliedBy(1.1).integerValue().toString();

                const transaction = {
                    from: account,
                    to: WBTC_CONTRACT_ADDRESS,
                    data: data,
                    gas: gasLimit,
                    gasPrice: gasPrice,
                };

                const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
                web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                    .on('receipt', (receipt) => {
                        console.log(receipt);
                        setTransactionHistory([...transactionHistory, receipt]);
                    });
            } catch (error) {
                console.error('Error sending transaction:', error);
            }
        }
    };

    const signTransaction = async () => {
        if (coin === 'ETH') {
            try {
                const privateKey = await getPrivateKeyFromMnemonic(mnemonic);
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
                const gasPrice = new BigNumber(currentGasPrice).multipliedBy(1.1).integerValue().toString();

                const transaction = {
                    from: account,
                    to: formattedRecipient,
                    value: web3.utils.toWei(amount, 'ether'),
                    gas: gasLimit,
                    gasPrice: gasPrice,
                };

                const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
                setSignedTransaction(signedTransaction.rawTransaction);
            } catch (error) {
                console.error('Error signing transaction:', error);
            }
        } else if (coin === 'WBTC') {
            try {
                const privateKey = await getPrivateKeyFromMnemonic(mnemonic);
                let formattedRecipient = recipient.trim();
                if (!formattedRecipient.startsWith('0x')) {
                    formattedRecipient = '0x' + formattedRecipient;
                }
                if (formattedRecipient.length !== 42) {
                    throw new Error('Invalid recipient address length');
                }

                const contract = new web3.eth.Contract(WBTC_ABI, WBTC_CONTRACT_ADDRESS);
                const data = contract.methods.transfer(formattedRecipient, web3.utils.toWei(amount, 'ether')).encodeABI();

                const gasLimit = await web3.eth.estimateGas({
                    from: account,
                    to: WBTC_CONTRACT_ADDRESS,
                    data: data,
                });

                const currentGasPrice = await web3.eth.getGasPrice();
                const gasPrice = new BigNumber(currentGasPrice).multipliedBy(1.1).integerValue().toString();

                const transaction = {
                    from: account,
                    to: WBTC_CONTRACT_ADDRESS,
                    data: data,
                    gas: gasLimit,
                    gasPrice: gasPrice,
                };

                const signedTransaction = await web3.eth.accounts.signTransaction(transaction, privateKey);
                setSignedTransaction(signedTransaction.rawTransaction);
            } catch (error) {
                console.error('Error signing transaction:', error);
            }
        }
    };

    const createAdditionalAddresses = async (numAddresses) => {
        try {
            if (!validateMnemonic(mnemonic)) {
                throw new Error('Invalid mnemonic phrase');
            }
            const seed = await mnemonicToSeed(mnemonic);
            const hdWallet = hdkey.fromMasterSeed(seed);
            const newAddresses = [];
            for (let i = 1; i <= numAddresses; i++) {
                const derivedNode = hdWallet.derivePath(`m/44'/60'/0'/0/${i}`);
                const newAccount = derivedNode.getWallet();
                const address = `0x${newAccount.getAddress().toString('hex')}`;
                newAddresses.push(address);
            }
            setDerivedAddresses(newAddresses);
        } catch (error) {
            console.error('Error creating additional addresses:', error);
        }
    };

    return (
        <div className="p-4 bg-white rounded shadow-md w-full max-w-sm">
            <h1 className="text-xl font-bold mb-4">HD Wallet</h1>
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
            <div className="mb-4">
                <label className="block text-gray-700">Enter Mnemonic to Restore Wallet:</label>
                <textarea
                    value={mnemonicInput}
                    onChange={(e) => setMnemonicInput(e.target.value)}
                    className="mt-1 p-2 border rounded w-full"
                    rows="2"
                />
            </div>
            <button onClick={restoreHDWallet} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">Restore HD Wallet</button>
            <div className="mb-4">
                <label className="block text-gray-700">Select Coin:</label>
                <select
                    value={coin}
                    onChange={(e) => setCoin(e.target.value)}
                    className="mt-1 p-2 border rounded w-full"
                >
                    <option value="ETH">ETH</option>
                    <option value="WBTC">WBTC</option>
                </select>
            </div>
            <button onClick={getBalance} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">Check Balance</button>
            <div className="mt-4">
                <label className="block text-gray-700">Account:</label>
                <input type="text" value={account} readOnly className="mt-1 p-2 border rounded w-full" />
            </div>
            <div className="mt-4">
                <label className="block text-gray-700">Balance:</label>
                <input type="text" value={balance} readOnly className="mt-1 p-2 border rounded w-full" />
            </div>
            <div className="mt-4">
                <label className="block text-gray-700">Recipient:</label>
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-1 p-2 border rounded w-full" />
            </div>
            <div className="mt-4">
                <label className="block text-gray-700">Amount:</label>
                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 p-2 border rounded w-full" />
            </div>
            <button onClick={sendTransaction} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Send Transaction</button>
            <button onClick={signTransaction} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded">Sign Transaction</button>
            {signedTransaction && (
                <div className="mt-4">
                    <label className="block text-gray-700">Signed Transaction:</label>
                    <textarea
                        value={signedTransaction}
                        readOnly
                        className="mt-1 p-2 border rounded w-full"
                        rows="4"
                    />
                </div>
            )}
            <button onClick={() => createAdditionalAddresses(5)} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">Create 5 Additional Addresses</button>
            <div className="mt-4">
                <h2 className="text-lg font-bold mb-2">Derived Addresses</h2>
                {derivedAddresses.map((address, index) => (
                    <div key={index} className="mb-2 p-2 border rounded">
                        <div><strong>Address {index + 1}:</strong> {address}</div>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <h2 className="text-lg font-bold mb-2">Transaction History</h2>
                {transactionHistory.map((tx, index) => (
                    <div key={index} className="mb-2 p-2 border rounded">
                        <div><strong>Transaction Hash:</strong> {tx.transactionHash}</div>
                        <div><strong>Block Number:</strong> {tx.blockNumber}</div>
                        <div><strong>From:</strong> {tx.from}</div>
                        <div><strong>To:</strong> {tx.to}</div>
                        <div><strong>Value:</strong> {tx.value ? web3.utils.fromWei(tx.value, 'ether') : 'N/A'} {coin}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wallet;
