<template>
    <div v-if="alsoBought.length" class="also-bought-section">
        <!-- Section Header -->
        <div class="also-bought-header">
            <div class="title-group">
                <span class="sub-heading">perfect pairing</span>
                <h3 class="main-heading">
                    <i class="fa-solid fa-utensils"></i> Customers Also Bought
                </h3>
            </div>
            <span class="co-purchase-hint">Frequently ordered together with this dish</span>
        </div>

        <!-- Cards Carousel / Row -->
        <div class="also-bought-grid">
            <div
                v-for="food in alsoBought"
                :key="food.food_id"
                class="also-bought-card"
            >
                <!-- Co-purchase Popularity Badge -->
                <div v-if="food.co_purchase_count" class="pair-badge" title="Co-purchase frequency">
                    <i class="fa-solid fa-fire"></i> {{ food.co_purchase_count }}x paired
                </div>

                <!-- Food Image Container -->
                <div class="also-bought-img-wrapper">
                    <img
                        :src="getFoodImage(food.food_src)"
                        :alt="food.food_name"
                        class="also-bought-img"
                        @error="onImageError"
                    />
                </div>

                <!-- Food Information -->
                <div class="also-bought-info">
                    <h4 class="also-bought-name" :title="food.food_name">
                        {{ food.food_name }}
                    </h4>

                    <div class="price-row">
                        <span class="final-price">
                            Fcfa {{ parseFloat(food.food_price) - parseFloat(food.food_discount) }}
                        </span>
                        <span v-if="parseFloat(food.food_discount) > 0" class="original-price">
                            Fcfa {{ parseFloat(food.food_price) }}
                        </span>
                    </div>

                    <!-- Add to Cart Action Button -->
                    <button
                        class="also-bought-btn"
                        :class="{ 'btn-added': isAdded(food.food_id) }"
                        :disabled="isAdding(food.food_id)"
                        @click="addToCart(food)"
                    >
                        <span v-if="isAdding(food.food_id)">
                            <i class="fas fa-spinner fa-spin"></i> Adding...
                        </span>
                        <span v-else-if="isAdded(food.food_id)">
                            <i class="fas fa-check"></i> Added ✓
                        </span>
                        <span v-else>
                            <i class="fa-solid fa-cart-plus"></i> Add to cart
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "AlsoBought",

    props: {
        foodId: {
            type: [Number, String],
            required: true,
        },
    },

    data() {
        return {
            alsoBought: [],
            addingId: null,
            addedId: null,
        };
    },

    watch: {
        foodId: {
            immediate: true,
            handler(newId) {
                this.fetchAlsoBought(newId);
            },
        },
    },

    methods: {
        getFoodImage(src) {
            if (!src) return "";
            try {
                return require(`../assets/images/${src}`);
            } catch (e) {
                return "";
            }
        },

        onImageError(e) {
            e.target.style.opacity = "0.5";
        },

        isAdding(id) {
            return this.addingId === parseInt(id, 10);
        },

        isAdded(id) {
            return this.addedId === parseInt(id, 10);
        },

        async fetchAlsoBought(id) {
            if (!id) return;
            try {
                const res = await axios.get(`/foods/${id}/also-bought?limit=5`);
                this.alsoBought = Array.isArray(res.data) ? res.data : [];
            } catch (err) {
                console.error("Also-bought fetch failed:", err);
                this.alsoBought = [];
            }
        },

        async addToCart(food) {
            const id = parseInt(food.food_id, 10);
            if (this.addingId === id) return;
            this.addingId = id;
            try {
                await this.$emit("add-to-cart", food);
                this.addedId = id;
                setTimeout(() => {
                    if (this.addedId === id) {
                        this.addedId = null;
                    }
                }, 1400);
            } finally {
                setTimeout(() => {
                    if (this.addingId === id) {
                        this.addingId = null;
                    }
                }, 300);
            }
        },
    },
};
</script>

<style scoped>
.also-bought-section {
    margin-top: 2.5rem;
    padding: 2rem 2.2rem;
    background: #fcfcfc;
    border: 1px solid #ededed;
    border-radius: 1.2rem;
    box-shadow: 0 0.4rem 1.4rem rgba(0, 0, 0, 0.03);
}

/* Header Section */
.also-bought-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1.6rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f0f0f0;
    flex-wrap: wrap;
    gap: 0.8rem;
}

.title-group {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.sub-heading {
    font-family: 'Satisfy', cursive;
    font-size: 1.9rem;
    color: #f38609;
    line-height: 1;
}

.main-heading {
    font-size: 2rem;
    font-weight: 700;
    color: #130f40;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.main-heading i {
    color: #27ae60;
    font-size: 1.8rem;
}

.co-purchase-hint {
    font-size: 1.3rem;
    color: #777;
    font-style: italic;
}

/* Horizontal Scroll Grid */
.also-bought-grid {
    display: flex;
    gap: 1.6rem;
    overflow-x: auto;
    padding: 0.6rem 0.4rem 1.4rem 0.4rem;
    scrollbar-width: thin;
    scrollbar-color: #27ae60 #f1f1f1;
    -webkit-overflow-scrolling: touch;
}

.also-bought-grid::-webkit-scrollbar {
    height: 6px;
}

.also-bought-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.also-bought-grid::-webkit-scrollbar-thumb {
    background: #27ae60;
    border-radius: 4px;
}

.also-bought-grid::-webkit-scrollbar-thumb:hover {
    background: #219150;
}

/* Card Styling */
.also-bought-card {
    min-width: 19rem;
    max-width: 19rem;
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 0.4rem 1rem rgba(0, 0, 0, 0.04);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    flex-shrink: 0;
}

.also-bought-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 0.8rem 2rem rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
}

/* Pairing Badge */
.pair-badge {
    position: absolute;
    top: 0.8rem;
    left: 0.8rem;
    z-index: 3;
    background: rgba(243, 134, 9, 0.92);
    color: #fff;
    font-size: 1.15rem;
    font-weight: 600;
    padding: 0.3rem 0.8rem;
    border-radius: 1.2rem;
    box-shadow: 0 0.2rem 0.6rem rgba(243, 134, 9, 0.3);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    letter-spacing: 0.2px;
}

/* Image Wrapper */
.also-bought-img-wrapper {
    width: 100%;
    height: 13rem;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.8rem;
    overflow: hidden;
    border-bottom: 1px solid #f2f2f2;
}

.also-bought-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
}

.also-bought-card:hover .also-bought-img {
    transform: scale(1.08);
}

/* Card Information */
.also-bought-info {
    padding: 1.2rem 1.4rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fff;
}

.also-bought-name {
    font-size: 1.45rem;
    font-weight: 600;
    color: #130f40;
    margin: 0 0 0.6rem 0;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
}

/* Price Row */
.price-row {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    margin-bottom: 1.2rem;
}

.final-price {
    font-size: 1.55rem;
    font-weight: 700;
    color: #27ae60;
}

.original-price {
    font-size: 1.25rem;
    color: #999;
    text-decoration: line-through;
}

/* Add to Cart Button */
.also-bought-btn {
    margin-top: auto;
    width: 100%;
    background: #27ae60;
    color: #fff;
    border: none;
    border-radius: 0.6rem;
    padding: 0.85rem 1rem;
    font-size: 1.3rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    box-shadow: 0 0.3rem 0.8rem rgba(39, 174, 96, 0.2);
}

.also-bought-btn:hover:not(:disabled) {
    background: #f38609;
    box-shadow: 0 0.4rem 1.2rem rgba(243, 134, 9, 0.3);
    transform: translateY(-1px);
}

.also-bought-btn:active:not(:disabled) {
    transform: translateY(0);
}

.also-bought-btn.btn-added {
    background: #219150 !important;
}

.also-bought-btn:disabled {
    opacity: 0.75;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

@media (max-width: 576px) {
    .also-bought-section {
        padding: 1.4rem 1.2rem;
    }

    .also-bought-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .main-heading {
        font-size: 1.8rem;
    }

    .also-bought-card {
        min-width: 16.5rem;
        max-width: 16.5rem;
    }

    .also-bought-img-wrapper {
        height: 11.5rem;
    }
}
</style>
