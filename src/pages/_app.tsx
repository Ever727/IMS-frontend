import Head from "next/head";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import store from "../redux/store";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import { Button } from "antd";
import React, { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/naming-convention
const App = ({ Component, pageProps }: AppProps) => {
    const router = useRouter();
    const [storedUserName, setStoredUserName] = useState<string | null>(null);
    const [storedToken, setStoredToken] = useState<string | null>(null);

    useEffect(() => {
        const userName = localStorage.getItem("userName");
        const token = localStorage.getItem("token");
        setStoredUserName(userName);
        setStoredToken(token);
    }, [router]);

    return (
        <>
            <Head>
                <title> TAsRight IMS</title>
            </Head>
            <div>
                <Component {...pageProps} />
                {(storedToken && storedUserName ? (
                    <div style={{ display: "flex", position: "fixed", justifyContent: "center", alignItems: "center", top: 0, right: 5, padding: 5, zIndex: 999 }}>
                        <p style={{ color: "white", marginRight: 12 }}>
                            欢迎你， {storedUserName}!
                        </p>
                        <Button style={{ marginRight: 12 }} type="primary" ghost onClick={() => {
                            router.push("/chat_interface");
                        }} >
                            聊天室
                        </Button>
                        <Button style={{ marginRight: 12 }} type="primary" danger onClick={() => {
                            localStorage.removeItem("userName");
                            localStorage.removeItem("token");
                            setStoredToken(null);
                            setStoredUserName(null);
                            router.push("/login");
                        }} >
                            登出
                        </Button>
                    </div>
                ) : ((
                    <Button type="primary" onClick={() => router.push("/login")} style={{ display: "flex", position: "fixed", justifyContent: "center", alignItems: "center", top: 18, right: 18, padding: 12, zIndex: 999 }}>去登录</Button>
                )))}
            </div>
        </>
    );
};

export default function AppWrapper(props: AppProps) {
    return (
        <Provider store={store}>
            <App {...props} />
        </Provider>
    );
}
