import { RootState } from "../redux/store";
import { resetAuth } from "../redux/auth";
import { NextRouter } from "next/router";
import { Button } from 'antd';
import { Dispatch } from "redux";


const Logout = (router: NextRouter, dispatch: Dispatch, auth: RootState["auth"]) => {

    return (
        <>
            <div style={{ display: 'flex', position: 'fixed', justifyContent: "center", alignItems: "center", top: 10, right: 20, zIndex: 999 }}>
                <p style={{ color: 'white', marginRight: 10 }}>
                    欢迎你， 用户{auth.name}!
                </p>
                <Button type="primary" danger onClick={() => { dispatch(resetAuth()); router.push("/login") }} >
                    登出
                </Button>
            </div>
        </>
    );
};

export default Logout;