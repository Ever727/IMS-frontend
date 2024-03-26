import Head from "next/head";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import store, { RootState } from "../redux/store";
import { useRouter } from "next/router";
import { Provider, useSelector, useDispatch } from "react-redux";
import Logout from "../components/Logout";

// eslint-disable-next-line @typescript-eslint/naming-convention
const App = ({ Component, pageProps }: AppProps) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const auth = useSelector((state: RootState) => state.auth);

    return (
        <>
            <Head>
                <title> Conway&#39;s life game</title>
            </Head>
            <div>
                <Component {...pageProps} />
                {router.pathname !== "/login" && router.pathname !== "/register" && router.pathname !== "/" && (auth.token ? (
                    Logout(router, dispatch, auth)
                ) : (
                    null
                ))}
            </div >
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
