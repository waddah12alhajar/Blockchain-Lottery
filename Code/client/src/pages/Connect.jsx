import React, { useContext } from "react";
import { Button, Container } from "react-bootstrap";

import { useNavigate, useParams } from "react-router-dom";
import DappContext from "../contexts/DappContext/DappContext";
import "./_Connect.scss";
// import images from "../images";
import Images from "../Assets/Images/Images.js";

const ethers = require("ethers");

export default function Connect() {
  const { updateSignedIn, updateUserType, updateAddress, updateState } =
    useContext(DappContext);
  const { _userType } = useParams();
  const navigate = useNavigate();
  const handleLogin = async () => {
    let signer = null;

    let provider;

    if (window.ethereum == null) {
      provider = ethers.getDefaultProvider();
    } else {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      // await provider.send("eth_requestAccounts", []);
      // signer = await provider.getSigner();
      const address = await signer.getAddress();
      if (_userType === "manager") {
        updateUserType("manager");
      } else {
        updateUserType("subscriber");
      }
      updateSignedIn(true);
      updateAddress(address);
      updateState(provider, signer);
      // need to change this
      _userType === "manager" ? navigate("/manager") : navigate("/");
    }
  };

  return (
    <Container className="connectContainer">
      <img src={Images.logo} alt="logo" />
      <h1>Connect to Metamask</h1>
      <span>
        <Button className="connectMetaMask" onClick={handleLogin}>Connect with Metamask</Button>
        <p>
          <b>Note:</b> To use EtherLotto, ensure you have Metamask installed and
          logged in. If not, download it{" "}
          <a href="https://metamask.io/download.html">here</a>. Click the button
          below to connect your Metamask account. If not logged in, first log in
          and then connect. If on the wrong account, switch and click to
          connect.
        </p>
      </span>
    </Container>
  );
}
