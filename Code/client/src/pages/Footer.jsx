import React from "react";
import "./_Footer.scss";

function Footer() {
    return (
        <div
            className="bg-dark text-light Footer"
            style={{
                minHeight: "10vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // White top border
                borderTop: "1px solid #e3e3e3",
            }}
        >
            <h3>EtherLotto - Safeguarding Your Money</h3>
        </div>
    );
}

export default Footer;
