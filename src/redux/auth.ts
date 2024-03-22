import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    token: string;
    name: string;
}

const initialState: AuthState = {
    token: "",
    name: "",
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        resetAuth: (state) => {
            state.token = "";
            state.name = "";
        },
    },
});

export const { setToken, setName, resetAuth } = authSlice.actions;
export default authSlice.reducer;
