import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./pages/Footer";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Error404 from "./pages/Error404";
import Draws from "./pages/Draws";
import NavBar from "./pages/NavBar";
import ManagerDashboard from "./pages/ManagerDashboard";
import PlayerDashboard from "./pages/PlayerDashboard";
import Connect from "./pages/Connect";

function App() {
    return (
        <div className="App">
            <Router>
                <NavBar />
                <Routes style={{ minHeight: "80vh" }}>
                    <Route path="/" element={<Home />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="draws" element={<Draws />} />
                    <Route path="signin" element={<Signin />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="*" element={<Error404 />}></Route>
                    <Route
                        path="/manager"
                        element={<ManagerDashboard />}
                    ></Route>
                    <Route path="/player" element={<PlayerDashboard />}></Route>
                    <Route
                        path="/connect/:_userType"
                        element={<Connect />}
                    ></Route>
                </Routes>
                <Footer />
            </Router>
        </div>
    );
}

export default App;
