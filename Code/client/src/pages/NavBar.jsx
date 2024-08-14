import React, { useContext, useEffect } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import DappContext from "../contexts/DappContext/DappContext";
import "./_Navbar.scss";

export default function NavBar() {
  const {
    signedIn,
    userType,
    address,
    updateSignedIn,
    updateUserType,
    updateAddress,
  } = useContext(DappContext);
  const navigate = useNavigate();
  useEffect(() => {}, [signedIn, userType, address]);
  const logout = () => {
    updateAddress(null);
    updateSignedIn(false);
    updateUserType(null);
    // need to warn user about changing account from metamask if needed
    navigate("/");
  };
  return (
    <Navbar
      className="navBar_main"
      bg="dark"
      data-bs-theme="dark"
      style={{ minHeight: "10vh" }}
    >
      <Container>
        <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>
          <h3>EtherLotto</h3>
        </Link>
        {signedIn && userType === "subscriber" && (
          <>
            <span> | </span>
            <Link
              className="player_tickets_link"
              to="/player"
              style={{ textDecoration: "none", color: "#fff" }}
            >
              My Tickets
            </Link>
          </>
        )}

        {(signedIn && userType === "manager" && window.location.pathname !== '/manager') && (
          <>
            <span> | </span>
            <Link
              className="player_tickets_link"
              to="/manager"
              style={{ textDecoration: "none", color: "#fff" }}
            >
              Manager Dashboard
            </Link>
          </>
        )}

        <Navbar.Toggle />

        {window.location.pathname !== "/connect/manager" &&
        window.location.pathname !== "/connect/subscriber" ? (
          <Navbar.Collapse
            className="justify-content-end"
            style={{
              color: "#ffffff",
            }}
          >
            {!signedIn ? (
              <div
                style={{
                  width: "200px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Nav.Link href="/connect/subscriber">User Login</Nav.Link>
                <span> | </span>
                <Nav.Link href="/connect/manager">Manager Login</Nav.Link>
              </div>
            ) : (
              <div
                style={{
                  width: "230px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Nav.Link
                  href="/"
                  className="text-truncate"
                  style={{ width: "180px" }}
                >
                  Logged using {address}
                </Nav.Link>
                <span> | </span>

                <i
                  className="bi bi-box-arrow-right"
                  onClick={logout}
                  style={{ cursor: "pointer" }}
                ></i>
              </div>
            )}
          </Navbar.Collapse>
        ) : (
          // Show home button
          <Navbar.Collapse
            className="justify-content-end"
            style={{
              color: "#ffffff",
            }}
          >
            <Nav.Link href="/">
              <i className="bi bi-house-door-fill"></i>&nbsp;Home
            </Nav.Link>
          </Navbar.Collapse>
        )}
      </Container>
    </Navbar>
  );
}
