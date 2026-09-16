import {createStore} from "vuex"
import axios from "axios"

const store = createStore({
    state() {
        return {
            allFoods: [],
            user: undefined,
            admin: undefined,
            cartItemCount: 0,
        }
    },
    mutations: {
        setFoodsData(state, payload){
            state.allFoods = payload;
        },
        setUser(state, payload){
            state.user = payload;
            if (!payload || !payload.user_id) {
                state.cartItemCount = 0;
            }
        },
        setAdmin(state, payload){
            state.admin = payload;
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