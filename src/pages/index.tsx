import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import BoardUI from "../components/BoardUI";
import { CREATE_SUCCESS, FAILURE_PREFIX, LOGIN_REQUIRED, UPDATE_SUCCESS } from "../constants/string";
import { getBlankBoard, stepBoard, flipCell, boardToString, stringToBoard } from "../utils/logic";
import { NetworkError, NetworkErrorType, request } from "../utils/network";
import { RootState } from "../redux/store";
import { resetBoardCache, setBoardCache } from "../redux/board";
import { useSelector, useDispatch } from "react-redux";

const BoardScreen = () => {
    /**
     * @todo [Step 3] 请在下述一处代码缺失部分填写合适的代码，使得棋盘状态正确切换且计时器资源分配、释放合理
     */
    const boardCache = useSelector((state: RootState) => state.board.board);
    const userName = useSelector((state: RootState) => state.auth.name);

    const dispatch = useDispatch();

    const [id, setId] = useState<undefined | number>(undefined);
    const [initBoard, setInitBoard] = useState(getBlankBoard());
    const [board, setBoard] = useState(boardCache);
    const [autoPlay, setAutoPlay] = useState(false);
    const [recordUserName, setRecordUserName] = useState("");
    const [boardName, setBoardName] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const timerRef = useRef<undefined | NodeJS.Timeout>(undefined);

    const router = useRouter();
    const query = router.query;

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        if (router.query.id === undefined) {
            // @todo 这里需要考虑是否需要加载缓存
            setId(undefined);
            return;
        }
        if (!/^[0-9]+$/.test(router.query.id as string)) {
            router.replace("/");
            return;
        }

        setRefreshing(true);
        setId(Number(router.query.id));
        request(`/api/boards/${router.query.id}`, "GET", false)
            .then((res) => {
                const fetchedBoard = stringToBoard(res.board);

                setBoard(fetchedBoard);
                setInitBoard(fetchedBoard);
                setBoardName(res.boardName);
                setRecordUserName(res.userName);
            })
            .catch((err) => {
                alert(FAILURE_PREFIX + err);
                router.push("/");
            })
            .finally(() => setRefreshing(false));
    }, [router, query]);

    useEffect(() => () => {
        clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        if (id === undefined) {
            dispatch(resetBoardCache());
        }

        return () => {
            if (id === undefined) {
                dispatch(setBoardCache(board));
            }
        };
    }, [board, id, dispatch]);

    const switchAutoPlay = () => {
        // Step 3 BEGIN
        if (autoPlay) {
            clearInterval(timerRef.current);
            timerRef.current = undefined;
        }
        else {
            timerRef.current = setInterval(() => {
                setBoard((board) => stepBoard(board));
            }, 200);
        }
        // Step 3 END
    };

    const saveBoard = () => {
        request(
            "/api/boards",
            "POST",
            true,
            {
                userName,
                boardName,
                board: boardToString(board),
            }
        )
            .then((res) => alert(res.isCreate ? CREATE_SUCCESS : UPDATE_SUCCESS))
            .catch((err) => {
                if (
                    err instanceof NetworkError &&
                    err.type === NetworkErrorType.UNAUTHORIZED
                ) {
                    alert(LOGIN_REQUIRED);
                    router.push("/login");
                }
                else {
                    alert(FAILURE_PREFIX + err);
                }
            });
    };

    return refreshing ? (
        <p> Loading... </p>
    ) : (
        <>
            {id === undefined ? (
                <h4> Free Mode </h4>
            ) : (
                <h4> Replay Mode, Board ID: {id}, Author: {recordUserName} </h4>
            )}
            <BoardUI board={board} flip={(i, j) => {
                if (!autoPlay) setBoard((board) => flipCell(board, i, j));
            }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button onClick={() => setBoard((board) => stepBoard(board))} disabled={autoPlay}>
                        Step the board
                    </button>
                    <button onClick={() => setBoard(getBlankBoard())} disabled={autoPlay}>
                        Clear the board
                    </button>
                    {id !== undefined && (
                        <button onClick={() => setBoard(initBoard)} disabled={autoPlay}>
                            Undo all changes
                        </button>
                    )}
                    <button onClick={switchAutoPlay}>
                        {autoPlay ? "Stop" : "Start"} auto play
                    </button>
                </div>
                {id === undefined && (
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        <input
                            type="text"
                            placeholder="Name of this Board"
                            value={boardName}
                            disabled={autoPlay}
                            onChange={(e) => setBoardName(e.target.value)}
                        />
                        <button onClick={saveBoard} disabled={autoPlay || boardName === ""}>
                            Save board
                        </button>
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button onClick={() => router.push("/list")}>
                        Go to full list
                    </button>
                    {id !== undefined && (
                        <button onClick={() => router.push("/")}>
                            Go back to free mode
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default BoardScreen;
