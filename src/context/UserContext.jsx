import React, { createContext, useContext, useState } from "react";
import {
  Address,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionOutput,
  Value,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  LinearFee,
  BigNum,
  TransactionWitnessSet,
  Transaction,
} from "@emurgo/cardano-serialization-lib-asmjs";
import { Buffer } from "buffer";

const initialUserContext = {
  address: "",
  balance: 0,
  setAddress: () => {},
  setBalance: () => {},
  isTestnet: false,
  setIsTestnet: () => {},
  isWhiteListed: false,
  setIsWhiteListed: () => {},
  setWhichWalletSelected: () => {},
  whichWalletSelected: "",
};

export const UserContext = createContext(initialUserContext);

export const UserProvider = ({ children }) => {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [isWhiteListed, setIsWhiteListed] = useState(false);
  const [whichWalletSelected, setWhichWalletSelected] = useState("");
  const [walletFound, setWalletFound] = useState(false);
  const [walletIsEnabled, setWalletIsEnabled] = useState(false);
  const [walletName, setWalletName] = useState(null);
  const [walletAPIVersion, setWalletAPIVersion] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [networkId, setNetworkId] = useState(null);
  const [Utxos, setUtxos] = useState(null);
  const [changeAddress, setChangeAddress] = useState(null);
  const [usedAddress, setUsedAddress] = useState(null);
  const [txBody, setTxBody] = useState(null);
  const [submittedTxHash, setSubmittedTxHash] = useState("");
  const [addressBech32SendADA, setAddressBech32SendADA] = useState(
    "addr_test1qrp4ym07g7g56036elcycnzhverwkkxcl7886cyglhnq095zq6t8xc7q4dlfnfwrt059wpnglfeltvfajxg3rddt2hts7ur0uc"
  );
  const [lovelaceToSend, setLovelaceToSend] = useState(3000000);
  const [protocolParams] = useState({
    linearFee: {
      minFeeA: "44",
      minFeeB: "155381",
    },
    minUtxo: "34482",
    poolDeposit: "500000000",
    keyDeposit: "2000000",
    maxValSize: 5000,
    maxTxSize: 16384,
    priceMem: 0.0577,
    priceStep: 0.0000721,
    coinsPerUtxoWord: "34482",
  });

  const [API, setAPI] = useState();
  const pollWallets = (count = 0) => {
    const wallets = [];
    for (const key in window?.cardano) {
      if (window.cardano[key].enable && wallets.indexOf(key) === -1) {
        wallets.push(key);
      }
    }
    if (wallets.length === 0 && count < 1) {
      setTimeout(() => {
        pollWallets(count + 1);
      }, 1000);
      return;
    }
    setWallets(wallets);
    setWhichWalletSelected(wallets[0]);
    refreshData();
  };
  const handleWalletSelect = (value) => {
    const selectedWallet = value;
    setWhichWalletSelected(selectedWallet);
    refreshData();
  };

  const checkIfWalletFound = () => {
    const walletKey = whichWalletSelected;
    const walletFound = !!window?.cardano?.[walletKey];
    setWalletFound(walletFound);
    return walletFound;
  };
  console.log(walletFound, "walletFoundIfFound");
  const checkIfWalletEnabled = async () => {
    let walletEnabled = false;
    try {
      const walletName = whichWalletSelected;
      walletEnabled = await window.cardano[walletName].isEnabled();
    } catch (err) {
      console.log(err);
    }
    setWalletIsEnabled(walletEnabled);
    return walletEnabled;
  };

  const enableWallet = async () => {
    const walletKey = whichWalletSelected;
    try {
      const api = await window.cardano[walletKey].enable();
      setAPI(api);
    } catch (err) {
      console.log(err);
    }
    return checkIfWalletEnabled();
  };

  const getAPIVersion = () => {
    const walletKey = whichWalletSelected;
    const walletAPIVersion = window?.cardano?.[walletKey].apiVersion;
    setWalletAPIVersion(walletAPIVersion);
    return walletAPIVersion;
  };

  const getWalletName = () => {
    const walletKey = whichWalletSelected;
    const walletName = window?.cardano?.[walletKey].name;
    setWalletName(walletName);
    return walletName;
  };

  const getNetworkId = async () => {
    try {
      const networkId = await API.getNetworkId();
      setNetworkId(networkId);
    } catch (err) {
      console.log(err);
    }
  };

  const getUtxos = async () => {
    let Utxos = [];
    try {
      const rawUtxos = await API.getUtxos();
      for (const rawUtxo of rawUtxos) {
        const utxo = TransactionUnspentOutput.from_bytes(
          Buffer.from(rawUtxo, "hex")
        );
        const input = utxo.input();
        const txid = Buffer.from(
          input.transaction_id().to_bytes(),
          "utf8"
        ).toString("hex");
        const txindx = input.index();
        const output = utxo.output();
        const amount = output.amount().coin().to_str(); // ADA amount in lovelace
        const multiasset = output.amount().multiasset();
        let multiAssetStr = "";

        if (multiasset) {
          const keys = multiasset.keys();
          const N = keys.len();
          for (let i = 0; i < N; i++) {
            const policyId = keys.get(i);
            const policyIdHex = Buffer.from(
              policyId.to_bytes(),
              "utf8"
            ).toString("hex");
            const assets = multiasset.get(policyId);
            const assetNames = assets?.keys();
            const K = assetNames?.len();
            for (let j = 0; j < K; j++) {
              const assetName = assetNames?.get(j);
              const assetNameString = Buffer.from(
                assetName.name(),
                "utf8"
              ).toString();
              const assetNameHex = Buffer.from(
                assetName.name(),
                "utf8"
              ).toString("hex");
              const multiassetAmt = multiasset.get_asset(policyId, assetName);
              multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`;
            }
          }
        }
        const obj = {
          txid: txid,
          txindx: txindx,
          amount: amount,
          str: `${txid} #${txindx} = ${amount}`,
          multiAssetStr: multiAssetStr,
          TransactionUnspentOutput: utxo,
        };
        Utxos.push(obj);
      }
      setUtxos(Utxos);
    } catch (err) {
      console.log(err);
    }
  };
  const getBalance = async () => {
    try {
      const balanceCBORHex = await API.getBalance();
      const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex"))
        .coin()
        .to_str();
      setBalance(Number(balance / 10e5).toFixed(2));
    } catch (err) {
      console.log(err);
    }
  };
  const getChangeAddress = async () => {
    try {
      const raw = await API.getChangeAddress();
      const changeAddress = Address.from_bytes(
        Buffer.from(raw, "hex")
      ).to_bech32();
      setChangeAddress(changeAddress);
    } catch (err) {
      console.log(err);
    }
  };
  const getUsedAddresses = async () => {
    try {
      const raw = await API.getUsedAddresses();
      const rawFirst = raw[0];
      const usedAddress = Address.from_bytes(
        Buffer.from(rawFirst, "hex")
      ).to_bech32();
      setUsedAddress(usedAddress);
    } catch (err) {
      console.log(err);
    }
  };
  const refreshData = async () => {
    try {
      const walletFound = checkIfWalletFound();
      if (walletFound) {
        await getAPIVersion();
        await getWalletName();
        const walletEnabled = await enableWallet();
        if (walletEnabled) {
          await getNetworkId();
          await getUtxos();
          await getBalance();
          await getChangeAddress();
          await getUsedAddresses();
        } else {
          setUtxos(null);
          setBalance(0);
          setChangeAddress(null);
          setUsedAddress(null);
          setTxBody(null);
          setSubmittedTxHash("");
        }
      } else {
        setWalletIsEnabled(false);
        setUtxos(null);
        setBalance(0);
        setChangeAddress(null);
        setUsedAddress(null);
        setTxBody(null);
        setSubmittedTxHash("");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const initTransactionBuilder = async () => {
    const txBuilder = TransactionBuilder.new(
      TransactionBuilderConfigBuilder.new()
        .fee_algo(
          LinearFee.new(
            BigNum.from_str(protocolParams.linearFee.minFeeA),
            BigNum.from_str(protocolParams.linearFee.minFeeB)
          )
        )
        .pool_deposit(BigNum.from_str(protocolParams.poolDeposit))
        .key_deposit(BigNum.from_str(protocolParams.keyDeposit))
        .coins_per_utxo_word(BigNum.from_str(protocolParams.coinsPerUtxoWord))
        .max_value_size(protocolParams.maxValSize)
        .max_tx_size(protocolParams.maxTxSize)
        .prefer_pure_change(true)
        .build()
    );
    return txBuilder;
  };
  const getTxUnspentOutputs = async () => {
    let txOutputs = TransactionUnspentOutputs.new();
    for (const utxo of Utxos) {
      txOutputs.add(utxo.TransactionUnspentOutput);
    }
    return txOutputs;
  };
  const buildSendADATransaction = async () => {
    const txBuilder = await initTransactionBuilder();
    const shelleyOutputAddress = Address.from_bech32(addressBech32SendADA);
    const shelleyChangeAddress = Address.from_bech32(changeAddress);
    txBuilder.add_output(
      TransactionOutput.new(
        shelleyOutputAddress,
        Value.new(BigNum.from_str(lovelaceToSend.toString()))
      )
    );
    const txUnspentOutputs = await getTxUnspentOutputs();
    txBuilder.add_inputs_from(txUnspentOutputs, 1);
    txBuilder.add_change_if_needed(shelleyChangeAddress);
    const txBody = txBuilder.build();
    const transactionWitnessSet = TransactionWitnessSet.new();
    const tx = Transaction.new(
      txBody,
      TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
    );
    let txVkeyWitnesses = await API.signTx(
      Buffer.from(tx.to_bytes(), "utf8").toString("hex"),
      true
    );
    txVkeyWitnesses = TransactionWitnessSet.from_bytes(
      Buffer.from(txVkeyWitnesses, "hex")
    );
    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
    const signedTx = Transaction.new(tx.body(), transactionWitnessSet);
    const submittedTxHash = await API.submitTx(
      Buffer.from(signedTx.to_bytes(), "utf8").toString("hex")
    );
    console.log(submittedTxHash);
    setSubmittedTxHash(submittedTxHash);
  };

  return (
    <UserContext.Provider
      value={{
        address,
        balance,
        setAddress,
        setBalance,
        isWhiteListed,
        setIsWhiteListed,
        whichWalletSelected,
        setWhichWalletSelected,
        walletFound,
        setWalletFound,
        walletIsEnabled,
        setWalletIsEnabled,
        walletName,
        setWalletName,
        walletAPIVersion,
        setWalletAPIVersion,
        wallets,
        setWallets,
        networkId,
        setNetworkId,
        Utxos,
        setUtxos,
        changeAddress,
        setChangeAddress,
        usedAddress,
        setUsedAddress,
        submittedTxHash,
        setSubmittedTxHash,
        addressBech32SendADA,
        handleWalletSelect,
        buildSendADATransaction,
        pollWallets,
        refreshData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
