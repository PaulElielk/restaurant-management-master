import {createStore} from "vuex"
import axios from "axios"

function getStoredItem(key) {
    try {
        const item = localStorage.getItem(key);
        if (!item) return undefined;
        const parsed = JSON.parse(item);
        return parsed !== null && parsed !== "" ? parsed : undefined;
    } catch (e) {
        console.error(`Failed to retrieve ${key} from storage:`, e);
        return undefined;
    }
}

const store = createStore({
    state() {
        return {
            allFoods: [],
            user: getStoredItem("user"),
            admin: getStoredItem("admin"),
            cartItemCount: 0,
        }
    },
    mutations: {
        setFoodsData(state, payload){
            state.allFoods = payload;
        },
        setUser(state, payload){
            state.user = payload || undefined;
            if (payload && payload.user_id) {
                try {
                    localStorage.setItem("user", JSON.stringify(payload));
                } catch (e) {
                    console.error("Failed to persist user session:", e);
                }
            } else {
                state.cartItemCount = 0;
                try {
                    localStorage.removeItem("user");
                } catch (e) {
                    console.error("Failed to clear user session:", e);
                }
            }
        },
        setAdmin(state, payload){
            state.admin = payload || undefined;
            if (payload) {
                try {
                    localStorage.setItem("admin", JSON.stringify(payload));
                } catch (e) {
                    console.error("Failed to persist admin session:", e);
                }
            } else {
                try {
                    localStorage.removeItem("admin");
                } catch (e) {
                    console.error("Failed to clear admin session:", e);
                }
            }
        },
        setCartItemCount(state, payload){
            state.cartItemCount = Number.isFinite(payload) ? Math.max(0, payload) : 0;
        }
    },
    actions: {
        async getFoodsData(context){
            await axios.get('/foods')
            .then(function (response) {
                context.commit("setFoodsData", response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        async getCartItemCount(context){
            const user = context.state.user;
            if (!user || !user.user_id) {
                context.commit("setCartItemCount", 0);
                return;
            }
            try {
                const response = await axios.get('/cartItem/' + user.user_id);
                if (Array.isArray(response.data)) {
                    const totalQty = response.data.reduce(
                        (sum, item) => sum + (parseInt(item.item_qty, 10) || 1),
                        0
                    );
                    context.commit("setCartItemCount", totalQty);
                } else {
                    context.commit("setCartItemCount", 0);
                }
            } catch (error) {
                console.error("Error fetching cart item count:", error);
                context.commit("setCartItemCount", 0);
            }
        }
    }
})

export default store;