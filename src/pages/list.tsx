import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DELETE_SUCCESS, FAILURE_PREFIX } from "../constants/string";
import { request } from "../utils/network";
import { BoardMetaData } from "../utils/types";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";

const ListScreen = () => {
    /**
     * @todo [Step 4] 请在下述一处代码缺失部分填写合适的代码，完成网络请求的管理
     */
    const userName = useSelector((state: RootState) => state.auth.name);

    const [refreshing, setRefreshing] = useState(true);
    const [selectedUserName, setSelectedUserName] = useState<string | undefined>(undefined);
    const [boardList, setBoardList] = useState<BoardMetaData[]>([]);

    const router = useRouter();
    const query = router.query;

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const name = router.query.name && decodeURIComponent(router.query.name as string);
        setSelectedUserName(name);
        fetchList(name);
    }, [router, query]);

    const fetchList = (name?: string) => {
        setRefreshing(true);
        request(name ? `/api/user/${name}` : "/api/boards", "GET", false)
            .then((res) => setBoardList(res.boards))
            .catch((err) => alert(FAILURE_PREFIX + err))
            .finally(() => setRefreshing(false));
    };

    const deleteBoard = (id: number) => {
        // Step 4 BEGIN
        setRefreshing(true);
        request(`/api/board/${id}`, "DELETE", false)
            .then((res) => {
                if (res.code === 0) {
                    alert(DELETE_SUCCESS);
                }
                else {
                    alert(FAILURE_PREFIX + res.msg);
                }
            })
            .catch((err) => alert(FAILURE_PREFIX + err))
            .finally(() => setRefreshing(false));
        // Step 4 END
    };

    return refreshing ? (
        <p> Loading... </p>
    ) : (
        <>
            {selectedUserName !== undefined && <h4> Boards of {selectedUserName} </h4>}
            <button onClick={() => router.push("/")}>
                Go back to free mode
            </button>
            {selectedUserName !== undefined && (
                <button onClick={() => router.push("/list")}>
                    Go to full list
                </button>
            )}
            {boardList.length === 0 ? (
                <p> Empty list. </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>{
                    boardList.map((val, ind) => (
                        <div key={ind}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span>ID: {val.id}</span>
                                <span>Name: {val.boardName}</span>
                                <span>Created by: {val.userName}</span>
                                <span>Created at: {new Date(val.createdAt * 1000).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <button onClick={() => router.push(`/?id=${val.id}`)}>Play it</button>
                                {userName === val.userName && (
                                    <button onClick={() => deleteBoard(val.id)}>Delete it</button>
                                )}
                                <button onClick={() => router.push(`/list?name=${val.userName}`)}>
                                    View this user
                                </button>
                            </div>
                        </div>
                    ))
                }</div>
            )}
        </>
    );
};

export default ListScreen;