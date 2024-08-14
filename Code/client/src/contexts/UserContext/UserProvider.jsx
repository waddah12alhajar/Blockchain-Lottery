import { useState } from "react";
import UserContext from "./UserContext";

const UserProvider = ({ children }) => {
    const [userType, setUserType] = useState();
    const [signedIn, setSignedIn] = useState(false);
    const [address, setAddress] = useState("");
    const updateUserType = (type) => {
        setUserType(type);
    };
    const updateSignedIn = (value) => {
        setSignedIn(value);
    };
    const updateAddress = (_address) => {
        setAddress(_address);
    };
    return (
        <UserContext.Provider
            value={{ userType, updateUserType, signedIn, updateSignedIn, address, updateAddress }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
