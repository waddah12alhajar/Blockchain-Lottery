import abi from "../../contract/Lottery.json";
import { useEffect, useState } from "react";
import DappContext from "./DappContext";
import { ethers } from "ethers";
import CONTRACT_ADDRESS from "../../Constants";

const DappProvider = ({ children }) => {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        contract: null,
    });
    const [userType, setUserType] = useState();
    const [signedIn, setSignedIn] = useState(false);
    const [address, setAddress] = useState("");

    const contractAddress = CONTRACT_ADDRESS;
    const contractABI = abi.abi;
    const updateUserType = (type) => {
        setUserType(type);
    };

    const updateSignedIn = (value) => {
        setSignedIn(value);
    };

    const updateAddress = (_address) => {
        setAddress(_address);
    };

    const updateState = async (provider, signer) => {
        const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
        );
        setState({
            provider,
            signer,
            contract,
        });
    };

    return (
        <DappContext.Provider
            value={{
                state,
                updateState,
                userType,
                updateUserType,
                signedIn,
                updateSignedIn,
                address,
                updateAddress,
            }}
        >
            {children}
        </DappContext.Provider>
    );
};

export default DappProvider;
