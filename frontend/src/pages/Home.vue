<template>
    <div>
        <div class="home-main">
            <div class="content">
                <span>welcome foodies</span>
                <h3>The World in your plate😋</h3>
              
                <h4>Come enjoy our worldwide-themed restaurant with a menu from different countries each week.</h4>
                <p>We guarantee to use fresh food with the best quality. Customers will enjoy food from around the World with
                    explosive, sophisticated flavors.</p>
                <router-link @click="scrollToTop()" to="/menu" class="btn">order now</router-link>
            </div>
            <div class="image">
                <img src="../assets/images/b.png" alt="" class="home-img">
                <img src="../assets/images/a.png" alt="" class="home-parallax-img">
                
            </div>
        </div>

        <div v-if="recommendationsLoading" class="home-recommended">
            <h3>Loading recommendations...</h3>
        </div>

        <div v-else-if="recommendedFoods.length" class="home-recommended">
            <div class="recommended-head">
                <div class="rec-title-wrap">
                    <h3>{{ user ? "Recommended for you" : "Popular right now" }}</h3>
                    <router-link
                        v-if="user"
                        to="/profile#order-history"
                        class="history-pill-link"
                        title="View verified past orders that trigger these recommendations"
                    >
                        <i class="fa-solid fa-clock-rotate-left"></i> View Past Orders
                    </router-link>
                </div>
                <p>{{ user ? "Based on your order history" : "Top picks from all customers" }}</p>
            </div>

            <div class="recommended-grid">
                <div v-for="(food, index) in recommendedFoods" :key="`home-rec-${index}`" class="recommended-card">
                    <router-link :to="getMenuUrl(food)" class="rec-image-link" @click="scrollToTop()">
                        <img :src="require(`../assets/images/${food.food_src}`)" :alt="food.food_name" />
                    </router-link>
                    <h4>
                        <router-link :to="getMenuUrl(food)" class="rec-title-link" @click="scrollToTop()">
                            {{ food.food_name }}
                        </router-link>
                    </h4>
                    <p v-if="buildFoodSubtitle(food)" class="food-meta-subtitle">{{ buildFoodSubtitle(food) }}</p>
                    <p class="recommended-price">{{ parseFloat(food.food_price) - parseFloat(food.food_discount) }} Fcfa</p>
                    <p class="recommended-reason">{{ food.recommendation_reason }}</p>
                    <div class="card-btn-group">
                        <button class="btn btn-add-cart" :disabled="isAdding(food.food_id)" @click="quickAddToCart(food)">
                            <span v-if="isAdding(food.food_id)"><i class="fas fa-spinner fa-spin"></i> Adding...</span>
                            <span v-else-if="isAdded(food.food_id)"><i class="fas fa-check"></i> Added ✓</span>
                            <span v-else><i class="fas fa-cart-plus"></i> Add to cart</span>
                        </button>
                        <router-link :to="getMenuUrl(food)" class="btn btn-order-now" @click="scrollToTop()">
                            <i class="fas fa-utensils"></i> Order now
                        </router-link>
                    </div>
                </div>
            </div>
        </div>


        <div class="home-category">
            <router-link @click="scrollToTop()" to="/menu?category=taco" class="box">
                <img src="../assets/images/taco-img.png" alt="">
                <h3>taco</h3>
            </router-link>

            <router-link @click="scrollToTop()" to="/menu?category=burrito" class="box">
                <img src="../assets/images/burrito-img.png" alt="">
                <h3>burrito</h3>
            </router-link>

            <router-link @click="scrollToTop()" to="/menu?category=fast food" class="box">
                <img src="../assets/images/fastfood.png" alt="">
                <h3>Fast Food</h3>
            </router-link>

            <router-link @click="scrollToTop()" to="/menu?category=african" class="box">
                <img src="../assets/images/African/alloco.jpg" alt="">
                <h3>African</h3>
            </router-link>

            <router-link @click="scrollToTop()" to="/menu?category=sides" class="box">
                <img src="../assets/images/salad-img.png" alt="">
                <h3>sides</h3>
            </router-link>

            <router-link @click="scrollToTop()" to="/menu?category=dessert" class="box">
                <img src="../assets/images/dessert-img.png" alt="">
                <h3>dessert</h3>
            </router-link>

            <router-link @click="scrollToTop()" to="/menu?category=drink" class="box">
                <img src="../assets/images/coca-img.png" alt="">
                <h3>drink</h3>
            </router-link>
        </div>

        <div class="home-banner">
            <div class="grid-banner row">
                <div class="grid col-md-4">
                    <img src="../assets/images/dis-1.jpg" alt="">
                    <div class="content">
                        <span>special offer</span>
                        <h3>upto 50% off</h3>
                        <router-link @click="scrollToTop()" to="/menu" class="btn">order now</router-link>
                    </div>
                </div>

                <div class="grid col-md-4">
                    <img src="../assets/images/dis-2.png" alt="">
                    <div class="content center">
                        <span>special offer</span>
                        <h3>upto 25% extra</h3>
                        <router-link @click="scrollToTop()" to="/menu" class="btn">order now</router-link>
                    </div>
                </div>

                <div class="grid col-md-4">
                    <img src="../assets/images/dis-3.jpg" alt="">
                    <div class="content">
                        <span>limited offer</span>
                        <h3>100% cashback</h3>
                        <router-link @click="scrollToTop()" to="/menu" class="btn">order now</router-link>
                    </div>
                </div>

            </div>

        </div>

        <div class="home-about">
            <div class="image">
                <img src="../assets/images/about-img.jpg" alt="">
            </div>
            <div class="content">
                <span>why choose us?</span>
                <h3 class="title">what's make our food delicious!</h3>
                <p>Food to customers is always guaranteed of the best quality. Our dishes are made by chefs Mika and Kader (Two 5
                    Michelin stars chef), promising to bring explosive, delicate, impressive flavors. Our delivery
                    service is very professional, customers can enjoy the same quality at the restaurant</p>
                <router-link @click="scrollToTop()" to="/about" class="btn">read more</router-link>

                <div class="icons-container">
                    <div class="icons">
                        <img src="../assets/images/serv-1.png" alt="">
                        <h3>fast delivery</h3>
                    </div>
                    <div class="icons">
                        <img src="../assets/images/serv-2.png" alt="">
                        <h3>fresh food</h3>
                    </div>
                    <div class="icons">
                        <img src="../assets/images/serv-3.png" alt="">
                        <h3>best quality</h3>
                    </div>
                    <div class="icons">
                        <img src="../assets/images/serv-4.png" alt="">
                        <h3>24/7 support</h3>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
    name: "Home",
    data() {
        return {
            recommendationsLoading: false,
            recommendedFoods: [],
            addingIds: [],
            addedIds: [],
        };
    },

    computed: {
        ...mapState(["user"])
    },

    mounted() {
        this.getRecommendations();
    },

    watch: {
        user() {
            this.getRecommendations();
        }
    },

    methods: {
        getFoodCategory(food) {
            if (!food) return "all";
            const foodCat = String(food.food_category || "").toLowerCase().trim();
            const generalCat = String(food.category || "").toLowerCase().trim();
            const cuisine = String(food.cuisine_type || "").toLowerCase().trim();
            const src = String(food.food_src || "").toLowerCase().trim();

            if (
                cuisine === "ivorian" ||
                cuisine === "west_african" ||
                cuisine.includes("african") ||
                foodCat.includes("african") ||
                generalCat.includes("african") ||
                src.startsWith("african/")
            ) {
                return "african";
            }

            if (
                cuisine === "american" ||
                foodCat.includes("fast food") ||
                generalCat.includes("fast food") ||
                ["burger", "sandwich", "quick_bite", "wrap", "chicken"].includes(foodCat) ||
                ["burger", "sandwich", "quick_bite", "wrap", "chicken"].includes(generalCat) ||
                src.startsWith("fastfood/")
            ) {
                return "fast food";
            }

            if (foodCat.includes("taco") || generalCat.includes("taco") || src.includes("taco")) {
                return "taco";
            }
            if (foodCat.includes("burrito") || generalCat.includes("burrito") || src.includes("burrito")) {
                return "burrito";
            }
            if (foodCat.includes("nacho") || generalCat.includes("nacho") || src.includes("nacho")) {
                return "nachos";
            }
            if (foodCat.includes("drink") || generalCat.includes("drink") || src.includes("drink") || src.includes("coca")) {
                return "drink";
            }
            if (foodCat.includes("dessert") || generalCat.includes("dessert") || src.includes("dessert")) {
                return "dessert";
            }
            if (foodCat.includes("side") || generalCat.includes("side") || src.includes("side") || src.includes("salad")) {
                return "sides";
            }

            if (foodCat) return foodCat;
            if (generalCat) return generalCat;
            return "all";
        },

        getMenuUrl(food) {
            const category = this.getFoodCategory(food);
            const foodId = food && food.food_id ? food.food_id : "";
            return `/menu?category=${encodeURIComponent(category)}&food=${encodeURIComponent(foodId)}`;
        },

        async quickAddToCart(food) {
            if (!this.user) {
                this.$router.push("/login");
                return;
            }

            const foodId = parseInt(food.food_id, 10);
            if (this.addingIds.includes(foodId)) return;

            this.addingIds.push(foodId);

            try {
                const existItem = await axios.get(`/cartItem/${parseInt(this.user.user_id, 10)}/${foodId}`);
                if (existItem.data && existItem.data.length > 0) {
                    const currentQty = parseInt(existItem.data[0].item_qty, 10) || 1;
                    await axios.put("/cartItem/", {
                        user_id: parseInt(this.user.user_id, 10),
                        food_id: foodId,
                        item_qty: currentQty + 1
                    });
                } else {
                    await axios.post("/cartItem/", {
                        user_id: parseInt(this.user.user_id, 10),
                        food_id: foodId,
                        item_qty: 1
                    });
                }

                this.addedIds.push(foodId);
                await this.$store.dispatch("getCartItemCount");
                window.dispatchEvent(new CustomEvent("cart-updated"));
                setTimeout(() => {
                    this.addedIds = this.addedIds.filter(id => id !== foodId);
                }, 1500);
            } catch (err) {
                console.error("Failed to add recommended food to cart:", err);
            } finally {
                this.addingIds = this.addingIds.filter(id => id !== foodId);
            }
        },

        isAdding(foodId) {
            return this.addingIds.includes(parseInt(foodId, 10));
        },

        isAdded(foodId) {
            return this.addedIds.includes(parseInt(foodId, 10));
        },

        buildFoodSubtitle(food) {
            const normalize = (value) => {
                if (value === null || value === undefined) {
                    return "";
                }
                return String(value).trim();
            };
            const toLabel = (value) => normalize(value)
                .split(/[_\s]+/)
                .filter(Boolean)
                .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
                .join(" ");

            const parts = [];
            const veganByFlag = Number.parseInt(food.is_vegan, 10) === 1;
            const veganByLegacyType = normalize(food.food_type).toLowerCase() === "vegan";

            if (veganByFlag || veganByLegacyType) {
                parts.push("Vegan");
            } else if (normalize(food.meat_type)) {
                parts.push(toLabel(food.meat_type));
            } else if (normalize(food.food_type)) {
                parts.push(toLabel(food.food_type));
            }

            if (normalize(food.spice_level)) {
                parts.push(toLabel(food.spice_level));
            }

            if (normalize(food.cuisine_type)) {
                parts.push(toLabel(food.cuisine_type));
            } else if (normalize(food.category)) {
                parts.push(toLabel(food.category));
            } else if (normalize(food.food_category)) {
                parts.push(toLabel(food.food_category));
            }

            return parts
                .filter((value, index, allParts) => value && allParts.indexOf(value) === index)
                .slice(0, 3)
                .join(" | ");
        },

        async getRecommendations() {
            this.recommendationsLoading = true;
            try {
                const userId = this.user && this.user.user_id ? this.user.user_id : 0;
                const response = await axios.get(`/recommendations/${userId}?limit=4&minHistory=3&excludeCart=true`);
                this.recommendedFoods = Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                console.log(error);
                this.recommendedFoods = [];
            } finally {
                this.recommendationsLoading = false;
            }
        },

        scrollToTop() {
            window.scrollTo(0, 0);
        }
    }
};
</script>

<style scoped>
.home-main,
.home-about,
.home-banner,
.home-category,
.home-recommended {
    padding: 2rem 9%;
}

.home-main {
    display: flex;
    align-items: center;
    flex-wrap: wrap-reverse;
    gap: 2rem;
    position: relative;
    overflow: hidden;
}

.home-main .content {
    flex: 1 1 41rem;
}

.home-main .content span {
    font-size: 2rem;
    color: #27ae60;
}

.home-main .content h3 {
    font-size: 3.8rem;
    color: #130f40;
    padding-top: 1rem;
}
.home-main .content h4 {
    font-size: 2rem;
    color: #130f40;
    padding-top: 1rem;
}

.home-main .content p {
    font-size: 1.5rem;
    color: #666;
    line-height: 2;
    padding: 1rem 0;
}

.home-main .image {
    flex: 1 1 41rem;
    margin: 2rem 0;
    pointer-events: none;
}

.home-main .image .home-img {
    width: 100%;
    margin-top: 5rem;
}

.home-main .home-parallax-img {
    position: absolute;
    top: -15rem;
    right: -15rem;
    width: 80vw;

}


/* home category */
.home-category {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 1.5rem;
    padding-bottom: 5rem;
}

.home-category .box {
    padding: 2rem;
    text-align: center;
    border-radius: .5rem;
    background: #f7f7f7;
}

.home-category .box:hover {
    background: #27ae60;
}

.home-category .box:hover h3 {
    color: #fff;
}

.home-category .box img {
    height: 7rem;
}

.home-category .box h3 {
    font-size: 1.8rem;
    color: #130f40;
}

.home-recommended {
    background: #f7f7f7;
}

.home-recommended .recommended-head {
    margin-bottom: 1.5rem;
}

.home-recommended .rec-title-wrap {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.home-recommended .history-pill-link {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: #e8f8f0;
    color: #27ae60;
    border: 1px solid #b7ebd0;
    padding: 0.4rem 1.2rem;
    border-radius: 2rem;
    font-size: 1.3rem;
    font-weight: 600;
    transition: all 0.2s ease;
    text-transform: none;
}

.home-recommended .history-pill-link:hover {
    background: #27ae60;
    color: #fff;
    border-color: #27ae60;
}

.home-recommended .recommended-head h3 {
    color: #130f40;
    font-size: 2.8rem;
    margin: 0;
}

.home-recommended .recommended-head p {
    color: #666;
    font-size: 1.5rem;
    margin: 0;
}

.home-recommended .recommended-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    gap: 1.2rem;
}

.home-recommended .recommended-card {
    background: #fff;
    border-radius: 0.8rem;
    padding: 1.4rem 1.2rem;
    text-align: center;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.home-recommended .recommended-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.08);
}

.home-recommended .recommended-card .rec-image-link {
    display: block;
    cursor: pointer;
}

.home-recommended .recommended-card img {
    width: 100%;
    height: 14rem;
    object-fit: contain;
    transition: transform 0.25s ease;
}

.home-recommended .recommended-card:hover img {
    transform: scale(1.04);
}

.home-recommended .recommended-card h4 {
    font-size: 1.7rem;
    color: #130f40;
    text-transform: capitalize;
    margin-top: 0.8rem;
}

.home-recommended .recommended-card .rec-title-link {
    color: #130f40;
    text-decoration: none;
    transition: color 0.2s;
}

.home-recommended .recommended-card .rec-title-link:hover {
    color: #27ae60;
}

.home-recommended .recommended-card .food-meta-subtitle {
    font-size: 1.2rem;
    color: #666;
    margin: 0.3rem 0 0.5rem;
    line-height: 1.4;
}

.home-recommended .recommended-card .recommended-price {
    font-size: 1.6rem;
    font-weight: 700;
    color: #27ae60;
    margin: 0.2rem 0;
}

.home-recommended .recommended-card .recommended-reason {
    font-size: 1.25rem;
    color: #777;
    min-height: 3.2rem;
    margin: 0.4rem 0 1rem;
    line-height: 1.35;
}

.home-recommended .recommended-card .card-btn-group {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.8rem;
    align-items: center;
    justify-content: center;
}

.home-recommended .recommended-card .btn-add-cart {
    flex: 1;
    background: #27ae60;
    color: #fff;
    padding: 0.8rem 0.6rem;
    font-size: 1.25rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
}

.home-recommended .recommended-card .btn-add-cart:hover:not(:disabled) {
    background: #219150;
}

.home-recommended .recommended-card .btn-add-cart:disabled {
    opacity: 0.85;
    cursor: not-allowed;
}

.home-recommended .recommended-card .btn-order-now {
    flex: 1;
    background: #130f40;
    color: #fff;
    padding: 0.8rem 0.6rem;
    font-size: 1.25rem;
    border-radius: 0.5rem;
    text-align: center;
    white-space: nowrap;
    transition: background 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    font-weight: 600;
}

.home-recommended .recommended-card .btn-order-now:hover {
    background: #27ae60;
    color: #fff;
}


/* home banner */
.home-banner .row-banner {
    background: url(../assets/images/row-banner.png) no-repeat;
    height: 45rem;
    background-size: cover;
    background-position: center;
    position: relative;
}

.home-banner .row-banner .content {
    position: absolute;
    top: 50%;
    left: 7%;
    transform: translateY(-50%);
}

.home-banner .row-banner .content span {
    font-family: 'Satisfy', cursive;
    font-size: 4rem;
    color: #27ae60;
    color: #130f40;
}

.home-banner .row-banner .content h3 {
    font-size: 6rem;
    color: red;
    text-transform: uppercase;
}

.home-banner .row-banner .content p {
    font-size: 2rem;
    padding-bottom: 1rem;
}


.home-banner .grid-banner .grid {
    border-radius: 1rem;
    overflow: hidden;
    height: 45rem;
}

.home-banner .grid-banner .grid:hover img {
    transform: scale(1.2);
}

.home-banner .grid-banner .grid img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.home-banner .grid-banner .grid .content {
    position: absolute;
    top: 2rem;
    padding: 0 2rem;
}

.home-banner .grid-banner .grid .content.center {
    text-align: center;
    width: 100%;
}

.home-banner .grid-banner .grid .content.center span {
    color: #666;
}

.home-banner .grid-banner .grid .content.center h3 {
    color: #130f40;
}

.home-banner .grid-banner .grid .content span {
    font-size: 2.5rem;
    color: #fff;
}

.home-banner .grid-banner .grid .content h3 {
    font-size: 3rem;
    color: #fff;
    padding-top: .5rem;
}

.home-about {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2rem;
    background: #f7f7f7;
}

.home-about .image {
    flex: 1 1 40rem;
}

.home-about .image img {
    width: 100%;
}

.home-about .content {

    flex: 1 1 40rem;
}

.home-about .content span {
    font-family: 'Satisfy', cursive;
    font-size: 3rem;
    color: #27ae60;
}

.home-about .content .title {
    font-size: 3rem;
    padding-top: .5rem;
    color: #130f40;
}

.home-about .content p {
    padding: 1rem 0;
    line-height: 2;
    font-size: 1.4rem;
    color: #666;
}

.home-about .content .icons-container {
    margin-top: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.home-about .content .icons-container .icons {
    flex: 1 1 20rem;
    border-radius: .5rem;
    background: #fff;
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
}

.home-about .content .icons-container .icons h3 {
    font-size: 1.7rem;
    color: #130f40;
}

@media (max-width: 768px) {
    #menu-btn {
        display: inline-block;
    }

    .home-main .home-parallax-img {
        top: 0;
        right: 0;
        width: 100%;
    }

    .home-banner .grid-banner .content h3 {
        font-size: 15px !important;
    }

    .home-banner .grid-banner .content.center {
        padding-left: 0px !important;
    }

}

@media (max-width: 576px) {
    .home-main .content h3 {
        font-size: 3rem;
    }

    .home-main .content p {
        font-size: 1.5rem;
    }
}
.highlight-img {
    width: 100%;
    max-width: 400px;
    margin: 1rem 0;
    border-radius: 10px;
}

</style>




