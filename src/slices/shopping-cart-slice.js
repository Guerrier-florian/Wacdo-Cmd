import { createSlice } from "@reduxjs/toolkit";

const generateOrderNumber = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

const shoppingcartslice = createSlice({
    name: 'shopping-cart',
    initialState: {
        mode: null, // 'surplace' or 'aemporter'
        orderNumber: null,
        tableNumber: null, // 3 digits when 'surplace'
        cart: [], // [{id, nom, prix, image, quantity}]
        savedOrders: [], // list of completed orders
    },
    reducers: {
        setMode(state, action) {
            state.mode = action.payload;
        },
        setOrderNumber(state, action) {
            state.orderNumber = action.payload;
        },
        setTableNumber(state, action) {
            // Expect a string of 3 digits
            state.tableNumber = action.payload;
        },
        generateOrder(state) {
            state.orderNumber = generateOrderNumber();
        },
        addItem(state, action) {
            const p = action.payload;
            const existing = state.cart.find(it => 
                it.id === p.id && 
                it.menuChoice === p.menuChoice && 
                it.drinkSize === p.drinkSize
            );
            if (existing) {
                existing.quantity += 1;
            } else {
                state.cart.push({
                    id: p.id,
                    nom: p.nom,
                    prix: p.prix,
                    image: p.image,
                    menuChoice: p.menuChoice || null,
                    drinkSize: p.drinkSize || null,
                    quantity: 1,
                });
            }
        },
        removeItem(state, action) {
            const payload = action.payload
            const id = typeof payload === 'object' ? payload.id : payload
            const menuChoice = typeof payload === 'object' ? (payload.menuChoice ?? undefined) : undefined
            const drinkSize = typeof payload === 'object' ? (payload.drinkSize ?? undefined) : undefined
            const existing = state.cart.find(it => 
                it.id === id && 
                (menuChoice === undefined || it.menuChoice === menuChoice) &&
                (drinkSize === undefined || it.drinkSize === drinkSize)
            )
            if (!existing) return
            if (existing.quantity > 1) {
                existing.quantity -= 1
            } else {
                state.cart = state.cart.filter(it => !(
                    it.id === id && 
                    (menuChoice === undefined || it.menuChoice === menuChoice) &&
                    (drinkSize === undefined || it.drinkSize === drinkSize)
                ))
            }
        },
        // remove the entire line regardless of quantity
        removeLine(state, action) {
            const payload = action.payload
            const id = typeof payload === 'object' ? payload.id : payload
            const menuChoice = typeof payload === 'object' ? (payload.menuChoice ?? undefined) : undefined
            const drinkSize = typeof payload === 'object' ? (payload.drinkSize ?? undefined) : undefined
            state.cart = state.cart.filter(it => !(
                it.id === id && 
                (menuChoice === undefined || it.menuChoice === menuChoice) &&
                (drinkSize === undefined || it.drinkSize === drinkSize)
            ))
        },
        clearCart(state) {
            state.cart = []
        },
        saveOrder(state, action) {
            // action.payload = { orderNumber, mode, tableNumber, items, total, count, createdAt }
            state.savedOrders.push(action.payload)
        }
    }
});

export const { setMode, setOrderNumber, setTableNumber, generateOrder, addItem, removeItem, removeLine, clearCart, saveOrder } = shoppingcartslice.actions;

export default shoppingcartslice;
