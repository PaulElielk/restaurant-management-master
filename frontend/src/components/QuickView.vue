<template>
    <vue-basic-alert :duration="300" :closeIn="2000" ref="alert" />

    <div v-if="user" class="quick-view">
        <div class="quick-view-inner" v-for="f in selectedFood" :key="f">
            <h2 class="d-flex justify-content-between">{{ f.food_name }}
                <slot></slot>
            </h2>
            <div class="product-detail d-flex">
                <div class="image">
                    <img :src="require(`../assets/images/${f.food_src}`)" alt="" />
                </div>
                <div class="content">
                    <p class="desc">{{ f.food_desc }}</p>
                    <p class="money">Fcfa {{ parseFloat(f.food_price) - parseFloat(f.food_discount) }}<span
                            v-if="parseFloat(f.food_discount) > 0">Fcfa{{
                                    parseFloat(f.food_price)
                            }}</span></p>
                    <div class="qty">
                        <label for="qty">Quantity:</label>
                        <input type="number" name="qty" id="qty" value="1" min="1" max="1000"
                            @change="onQtyChange($event)" />
                    </div>
                    <button class="btn" :disabled="isAdding" @click="addToCart">
                        <span v-if="isAdding"><i class="fas fa-spinner fa-spin"></i> Adding...</span>
                        <span v-else-if="addedSuccess"><i class="fas fa-check"></i> Added ✓</span>
                        <span v-else>Add to cart</span>
                    </button>
                </div>
            </div>
            <also-bought :food-id="f.food_id" @add-to-cart="addToCartFromAlsoBought" />
        </div>
    </div>
    <div v-else class="quick-view">
        <div class="quick-view-inner">
            <h2 class="d-flex justify-content-between">Please login to use this method
                <slot></slot>
            </h2>
            <div class="link-to-login" style="text-align: center; margin-top: 120px;">
                <router-link class="btn" to="/login" style="padding: 28px; font-size: 24px">login now
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import VueBasicAlert from 'vue-basic-alert';
import AlsoBought from './AlsoBought.vue';
export default {
    props: ['food'],
    name: "QuickView",

    data() {
        return {
            qty: 1,
            isAdding: false,
            addedSuccess: false,
            addingAlsoBoughtId: null,
            addedAlsoBoughtId: null,
        }
    },

    computed: {
        ...mapState(["allFoods", "user"]),

        selectedFood: function () {
            return this.allFoods.filter((f) => parseInt(f.food_id) == parseInt(this.food));
        }
    },

    methods: {
        onQtyChange: function (e) {
            if (e.target.value < 1) {
                e.target.value = 1;
                this.qty = e.target.value;
            } else {
                this.qty = e.target.value;
            }
        },

        async addToCart() {
            if (this.isAdding) return;
            this.isAdding = true;

            try {
                let existItem = await axios.get('/cartItem/' + parseInt(this.user.user_id) + '/' + parseInt(this.food));

                if (existItem.data.length == 1) {
                    let data = {
                        user_id: parseInt(this.user.user_id),
                        food_id: parseInt(this.food),
                        item_qty: parseInt(this.qty) + parseInt(existItem.data[0].item_qty)
                    };
                    await axios.put("/cartItem/", data);
                } else {
                    let data = {
                        user_id: parseInt(this.user.user_id),
                        food_id: parseInt(this.food),
                        item_qty: parseInt(this.qty)
                    };

                    await axios.post("/cartItem/", data);
                }
                this.addedSuccess = true;
                this.$refs.alert.showAlert('success', 'Thank you!', 'Added To Cart Successfully !');
                setTimeout(() => {
                    this.addedSuccess = false;
                }, 1200);
            } catch (err) {
                console.error(err);
                this.$refs.alert.showAlert('error', 'Error', 'Failed to add item to cart. Please try again.');
            } finally {
                this.isAdding = false;
            }
        },

        async addToCartFromAlsoBought(food) {
            const foodId = parseInt(food.food_id);
            if (this.addingAlsoBoughtId === foodId) return;
            this.addingAlsoBoughtId = foodId;

            try {
                const userId = parseInt(this.user.user_id);
                let existItem = await axios.get(`/cartItem/${userId}/${foodId}`);
                if (existItem.data.length === 1) {
                    await axios.put('/cartItem/', {
                        user_id: userId,
                        food_id: foodId,
                        item_qty: 1 + parseInt(existItem.data[0].item_qty)
                    });
                } else {
                    await axios.post('/cartItem/', { user_id: userId, food_id: foodId, item_qty: 1 });
                }
                this.addedAlsoBoughtId = foodId;
                this.$refs.alert.showAlert('success', 'Thank you!', 'Added To Cart Successfully !');
                setTimeout(() => {
                    if (this.addedAlsoBoughtId === foodId) {
                        this.addedAlsoBoughtId = null;
                    }
                }, 1200);
            } catch (err) {
                console.error(err);
            } finally {
                this.addingAlsoBoughtId = null;
            }
        }
    },

    components: {
        VueBasicAlert,
        AlsoBought
    }
}
</script>

<style scoped>
.quick-view {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    background-color: rgba(0, 0, 0, 0.2);

    display: flex;
    align-items: center;
    justify-content: center;
}

.quick-view .quick-view-inner {
    width: 60vw;
    height: 85vh;
    background-color: #fff;
    padding: 32px;
    overflow-y: auto;
    border-radius: 12px;
}


.quick-view .quick-view-inner h2 {
    margin: 0;
    font-size: 32px;
    color: #27ae60;
}

.quick-view .quick-view-inner .product-detail .image img {
    height: 20rem;
    margin: 20px;
}

.quick-view .quick-view-inner .product-detail .content {
    margin-top: 20px;
    font-size: 20px;
    width: 100%;
}

.quick-view .quick-view-inner .product-detail .content p span {
    margin-left: 5px;
    text-decoration: line-through;
    opacity: 0.5;
}

.quick-view .quick-view-inner .product-detail .content div label {
    margin-right: 10px;
}

.quick-view .quick-view-inner .product-detail .content .btn {
    margin-top: 20px;
    float: right;
}

@media (max-width: 768px) {

    .quick-view .quick-view-inner {
        width: 70vw;
        height: 80vh;

    }

    .quick-view .quick-view-inner h2 {
        font-size: 20px;
    }

    .quick-view .quick-view-inner .btn {
        font-size: 10px;
        padding: 0.3rem 0.9rem;
    }

    .quick-view .quick-view-inner .product-detail .image img {
        height: 12rem;
        margin: 30px;
        margin-left: 0px;

    }

    .quick-view .quick-view-inner .product-detail .content .desc {
        font-size: 12px;
    }

    .quick-view .quick-view-inner .product-detail .content .qty {
        font-size: 12px;
    }

    .link-to-login {
        margin-top: 20px !important;
    }
}

@media (max-width: 576px) {
    .quick-view .quick-view-inner {
        width: 95vw;
        height: 85vh;
    }

    .link-to-login {
        margin-top: 50px !important;
    }

    .link-to-login>a {
        padding: 20px !important;
        font-size: 18px !important;
    }

}
</style>
