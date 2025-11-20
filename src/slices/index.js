import { configureStore } from "@reduxjs/toolkit";
import shoppingcartslice from "./shopping-cart-slice";

const store = configureStore({
    reducer: {
        shoppingCart: shoppingcartslice.reducer,
    },
});

export default store