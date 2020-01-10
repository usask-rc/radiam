import React from "react";

const RadiamLogo = props => {
    return(
        <a href="/#/">
            <img
                id="radiamlogo"
                src={require("../_assets/RadiamLogoClear_NoBorder.png")}
                alt="Radiam"
                height={70}
            />
        </a>
        )
    };

export default RadiamLogo;
