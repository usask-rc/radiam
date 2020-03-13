import React from "react";
import { ROLE_USER} from "../../_constants/index";
import { Responsive } from "ra-ui-materialui/lib/layout";
import { ToastContainer } from "react-toastify";
import { UserEdit } from "../../Users/Users";

const ChangeDetails = () => {
    const user = JSON.parse(localStorage.getItem(ROLE_USER))

    return (
        <Responsive
            medium={
                <>
                    <UserEdit basePath="/users" resource="users" id={user.id}  />
                    <ToastContainer />
                </>
            }
        />
    );
}

export default ChangeDetails;