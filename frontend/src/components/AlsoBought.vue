<template>
    <div v-if="alsoBought.length" class="also-bought-section">
        <h3 class="also-bought-title">Customers also bought</h3>
        <div class="also-bought-grid">
            <div
                v-for="food in alsoBought"
                :key="food.food_id"
                class="also-bought-card"
            >
                <div class="also-bought-img-wrapper">
                    <img
                        :src="require(`../assets/images/${food.food_src}`)"
                        :alt="food.food_name"
                        class="also-bought-img"
                    />
                </div>
                <div class="also-bought-info">
                    <p class="also-bought-name">{{ food.food_name }}</p>
                    <p class="also-bought-price">
                        {{ parseFloat(food.food_price) - parseFloat(food.food_discount) }} Fcfa
                    </p>
                    <button class="also-bought-btn" :disabled="isAdding(food.food_id)" @click="addToCart(food)">
                        <span v-if="isAdding(food.food_id)"><i class="fas fa-spinner fa-spin"></i> Adding...</span>
                        <span v-else-if="isAdded(food.food_id)"><i class="fas fa-check"></i> Added ✓</span>
                        <span v-else>+ Add to cart</span>
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
        // Re-fetch whenever the viewed food changes (e.g. navigating between items)
        foodId: {
            immediate: true,
            handler(newId) {
                this.fetchAlsoBought(newId);
            },
        },
    },

    methods: {
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
                }, 1200);
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
    margin-top: 3rem;
    padding: 1.5rem 1rem;
    background: #f8f9fa;
    border-radius: 12px;
}

.also-bought-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    position: relative;
    padding-bottom: 8px;
}

.also-bought-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #27ae60, #2ecc71);
    border-radius: 2px;
}

.also-bought-grid {
    display: flex;
    gap: 1.5rem;
    overflow-x: auto;
    padding: 10px 5px 20px 5px;
    scrollbar-width: thin;
    scrollbar-color: #27ae60 #e0e0e0;
}

.also-bought-grid::-webkit-scrollbar {
    height: 8px;
}

.also-bought-grid::-webkit-scrollbar-track {
    background: #e0e0e0;
    border-radius: 4px;
}

.also-bought-grid::-webkit-scrollbar-thumb {
    background: #27ae60;
    border-radius: 4px;
}

.also-bought-card {
    min-width: 220px;
    max-width: 220px;
    border: none;
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;
    position: relative;
}

.also-bought-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}

.also-bought-img-wrapper {
    overflow: hidden;
    height: 160px;
    width: 100%;
}

.also-bought-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.also-bought-card:hover .also-bought-img {
    transform: scale(1.1);
}

.also-bought-info {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fff;
    z-index: 2;
}

.also-bought-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 0.4rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.also-bought-price {
    font-size: 1.05rem;
    color: #27ae60;
    font-weight: 700;
    margin: 0 0 0.8rem;
}

.also-bought-btn {
    margin-top: auto;
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.7rem 0.9rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(39, 174, 96, 0.2);
}

.also-bought-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(39, 174, 96, 0.4);
}

.also-bought-btn:active {
    transform: translateY(0);
}

.also-bought-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
</style>
