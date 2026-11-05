<template>
    <div class="order-history-wrapper" id="order-history">
        <!-- Section Header -->
        <div class="history-header">
            <div class="header-left">
                <div class="header-icon-box">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div>
                    <div class="header-title-row">
                        <h3>Past Orders & History</h3>
                        <span class="badge-count" v-if="orders.length">
                            {{ orders.length }} {{ orders.length === 1 ? 'Order' : 'Orders' }}
                        </span>
                    </div>
                    <p class="header-sub">
                        <i class="fa-solid fa-brain ai-sparkle"></i>
                        These verified past purchases shape your <strong>AI Personalized Recommendations</strong> on the Home page.
                    </p>
                </div>
            </div>

            <!-- Header actions (Reload & Stats summary) -->
            <div class="header-right" v-if="orders.length">
                <div class="quick-stat-pill">
                    <span class="qs-label">Total Spent:</span>
                    <span class="qs-value">{{ totalSpent.toLocaleString() }} Fcfa</span>
                </div>
                <button @click="fetchOrderHistory" class="refresh-btn" :disabled="loading" title="Refresh order history">
                    <i class="fa-solid fa-arrows-rotate" :class="{ 'fa-spin': loading }"></i>
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="history-loading">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <span>Loading your order history...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="history-error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>{{ error }}</span>
            <button @click="fetchOrderHistory" class="retry-btn">Try Again</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="orders.length === 0" class="history-empty">
            <div class="empty-icon-box">
                <i class="fa-solid fa-receipt"></i>
            </div>
            <h4>No past orders found</h4>
            <p>
                You haven't completed any orders yet. Place your first order to build your taste profile and unlock AI-personalized menu recommendations!
            </p>
            <router-link to="/menu" class="btn empty-cta-btn">
                <i class="fa-solid fa-utensils"></i> Explore Menu
            </router-link>
        </div>

        <!-- Orders List / Table -->
        <div v-else class="history-content">
            <div class="history-table-container">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th class="col-id">Order ID</th>
                            <th class="col-date">Date & Time</th>
                            <th class="col-items">Items Purchased</th>
                            <th class="col-total">Total Price</th>
                            <th class="col-status">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in displayedOrders" :key="order.bill_id" class="history-row">
                            <!-- Order ID -->
                            <td class="col-id">
                                <div class="order-id-badge">
                                    <i class="fa-solid fa-hashtag"></i>
                                    <span>{{ order.bill_id }}</span>
                                </div>
                            </td>

                            <!-- Date & Time -->
                            <td class="col-date">
                                <div class="date-cell">
                                    <span class="date-main">{{ formatDate(order.bill_when).date }}</span>
                                    <span class="date-sub">{{ formatDate(order.bill_when).time }}</span>
                                </div>
                            </td>

                            <!-- Items Purchased -->
                            <td class="col-items">
                                <div v-if="order.items && order.items.length" class="items-list">
                                    <div
                                        v-for="(item, idx) in order.items"
                                        :key="`${order.bill_id}-${item.food_id || idx}`"
                                        class="item-pill"
                                    >
                                        <div class="item-img-wrap" v-if="getFoodImage(item.food_src)">
                                            <img
                                                :src="getFoodImage(item.food_src)"
                                                :alt="item.food_name"
                                                class="item-thumb"
                                                @error="onImageError"
                                            />
                                        </div>
                                        <span class="item-name">{{ item.food_name }}</span>
                                        <span class="item-qty-tag">× {{ item.item_qty }}</span>
                                        <span class="item-price-tag">{{ (item.unit_price || item.food_price || 0).toLocaleString() }} F</span>
                                    </div>
                                </div>
                                <span v-else class="text-muted">Direct Order Details</span>
                            </td>

                            <!-- Total Price -->
                            <td class="col-total">
                                <div class="total-cell">
                                    <span class="total-num">{{ (order.bill_total || 0).toLocaleString() }}</span>
                                    <span class="total-currency">Fcfa</span>
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="col-status">
                                <span class="status-badge" :class="getStatusClass(order.bill_status)">
                                    <i :class="getStatusIcon(order.bill_status)"></i>
                                    {{ getStatusLabel(order.bill_status) }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination / View All toggle if large history -->
            <div v-if="orders.length > maxDisplayInitial" class="history-footer">
                <button @click="showAll = !showAll" class="toggle-view-btn">
                    <span v-if="!showAll">
                        <i class="fa-solid fa-chevron-down"></i> Show all {{ orders.length }} past orders
                    </span>
                    <span v-else>
                        <i class="fa-solid fa-chevron-up"></i> Show recent {{ maxDisplayInitial }} orders
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
    name: "OrderHistory",

    props: {
        userId: {
            type: [Number, String],
            default: null
        }
    },

    data() {
        return {
            orders: [],
            loading: false,
            error: null,
            showAll: false,
            maxDisplayInitial: 8
        };
    },

    computed: {
        ...mapState(["user"]),

        activeUserId() {
            if (this.userId) return this.userId;
            return this.user && this.user.user_id ? this.user.user_id : null;
        },

        displayedOrders() {
            if (this.showAll) {
                return this.orders;
            }
            return this.orders.slice(0, this.maxDisplayInitial);
        },

        totalSpent() {
            return this.orders.reduce((sum, o) => sum + (Number(o.bill_total) || 0), 0);
        }
    },

    watch: {
        activeUserId: {
            immediate: true,
            handler(newId) {
                if (newId) {
                    this.fetchOrderHistory();
                } else {
                    this.orders = [];
                }
            }
        }
    },

    methods: {
        async fetchOrderHistory() {
            if (!this.activeUserId) return;
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`/orders/user/${this.activeUserId}`);
                if (Array.isArray(response.data)) {
                    this.orders = response.data;
                } else {
                    this.orders = [];
                }
            } catch (err) {
                console.error("Failed to fetch order history:", err);
                this.error = "Unable to load past orders. Please try again.";
            } finally {
                this.loading = false;
            }
        },

        formatDate(timestamp) {
            if (!timestamp) return { date: "Unknown date", time: "" };
            try {
                const d = new Date(timestamp);
                if (isNaN(d.getTime())) {
                    return { date: String(timestamp), time: "" };
                }
                const dateStr = d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                });
                const timeStr = d.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit"
                });
                return { date: dateStr, time: timeStr };
            } catch (e) {
                return { date: String(timestamp), time: "" };
            }
        },

        getFoodImage(src) {
            if (!src) return "";
            try {
                return require(`../assets/images/${src}`);
            } catch (e) {
                return "";
            }
        },

        onImageError(e) {
            if (e && e.target) {
                e.target.style.display = "none";
            }
        },

        getStatusLabel(status) {
            const map = {
                0: "Cancelled",
                1: "Confirmed",
                2: "Preparing",
                3: "Checking",
                4: "Delivering",
                5: "Delivered",
                6: "Completed"
            };
            const s = Number(status);
            return map[s] || "Completed";
        },

        getStatusClass(status) {
            const s = Number(status);
            if (s === 0) return "status-cancelled";
            if (s === 5 || s === 6) return "status-completed";
            if (s >= 1 && s <= 4) return "status-active";
            return "status-completed";
        },

        getStatusIcon(status) {
            const s = Number(status);
            if (s === 0) return "fa-solid fa-ban";
            if (s === 5 || s === 6) return "fa-solid fa-circle-check";
            if (s === 4) return "fa-solid fa-motorcycle";
            if (s === 2) return "fa-solid fa-fire-burner";
            return "fa-solid fa-hourglass-half";
        }
    }
};
</script>

<style scoped>
.order-history-wrapper {
    background: #ffffff;
    border: 1px solid #eef0f3;
    border-radius: 1.2rem;
    padding: 2.4rem;
    box-shadow: 0 0.5rem 1.8rem rgba(0, 0, 0, 0.04);
    margin-top: 3rem;
    margin-bottom: 3rem;
}

/* Header */
.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #f0f2f5;
}

.header-left {
    display: flex;
    align-items: flex-start;
    gap: 1.6rem;
}

.header-icon-box {
    width: 4.8rem;
    height: 4.8rem;
    border-radius: 1.2rem;
    background: #e8f8f0;
    color: #27ae60;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.2rem;
    flex-shrink: 0;
}

.header-title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.header-title-row h3 {
    font-size: 2rem;
    font-weight: 700;
    color: #130f40;
    margin: 0;
}

.badge-count {
    background: #f4f6f8;
    color: #555;
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0.3rem 0.9rem;
    border-radius: 2rem;
    border: 1px solid #e2e6eb;
}

.header-sub {
    font-size: 1.35rem;
    color: #666;
    margin: 0.4rem 0 0 0;
    line-height: 1.4;
}

.ai-sparkle {
    color: #f38609;
    margin-right: 0.4rem;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.quick-stat-pill {
    background: #fbfbfd;
    border: 1px solid #e9ecef;
    border-radius: 0.8rem;
    padding: 0.6rem 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.3rem;
}

.qs-label {
    color: #777;
    font-weight: 500;
}

.qs-value {
    color: #27ae60;
    font-weight: 700;
}

.refresh-btn {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 0.8rem;
    border: 1px solid #e2e6eb;
    background: #fff;
    color: #555;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    transition: all 0.2s ease;
}

.refresh-btn:hover {
    background: #f4f6f8;
    color: #27ae60;
    border-color: #27ae60;
}

/* Loading & Error */
.history-loading,
.history-error {
    text-align: center;
    padding: 4rem 2rem;
    font-size: 1.5rem;
    color: #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
}

.history-loading i {
    font-size: 2.8rem;
    color: #27ae60;
}

.history-error {
    color: #e74c3c;
}

.history-error i {
    font-size: 2.8rem;
}

.retry-btn {
    background: #27ae60;
    color: #fff;
    border: none;
    padding: 0.6rem 1.4rem;
    font-size: 1.3rem;
    border-radius: 0.6rem;
    cursor: pointer;
}

/* Empty State */
.history-empty {
    text-align: center;
    padding: 4rem 2rem;
    max-width: 45rem;
    margin: 0 auto;
}

.empty-icon-box {
    width: 7rem;
    height: 7rem;
    border-radius: 50%;
    background: #f7f9fa;
    color: #a0aec0;
    font-size: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem auto;
}

.history-empty h4 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #130f40;
    margin-bottom: 0.8rem;
}

.history-empty p {
    font-size: 1.4rem;
    color: #777;
    line-height: 1.5;
    margin-bottom: 2rem;
}

.empty-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    background: #27ae60;
    color: #fff;
    padding: 0.9rem 2rem;
    border-radius: 0.8rem;
    font-size: 1.4rem;
    font-weight: 600;
    transition: background 0.2s ease;
}

.empty-cta-btn:hover {
    background: #219150;
}

/* Table */
.history-table-container {
    overflow-x: auto;
    margin-top: 1.5rem;
}

.history-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 1.4rem;
    text-align: left;
}

.history-table th {
    background: #f9fafb;
    color: #555;
    font-weight: 600;
    padding: 1.2rem 1.4rem;
    border-bottom: 2px solid #edf0f2;
    text-transform: uppercase;
    font-size: 1.15rem;
    letter-spacing: 0.04rem;
}

.history-table td {
    padding: 1.4rem 1.4rem;
    border-bottom: 1px solid #edf0f2;
    vertical-align: middle;
}

.history-row:hover {
    background-color: #fafbfd;
}

/* Columns */
.col-id {
    width: 12%;
    white-space: nowrap;
}

.order-id-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 700;
    color: #130f40;
    background: #f0f2f5;
    padding: 0.4rem 0.8rem;
    border-radius: 0.6rem;
    font-size: 1.3rem;
}

.order-id-badge i {
    font-size: 1.1rem;
    color: #888;
}

.col-date {
    width: 18%;
    white-space: nowrap;
}

.date-cell {
    display: flex;
    flex-direction: column;
}

.date-main {
    font-weight: 600;
    color: #2d3748;
    font-size: 1.35rem;
}

.date-sub {
    font-size: 1.2rem;
    color: #888;
}

.col-items {
    width: 42%;
}

.items-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
}

.item-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    background: #f8faf9;
    border: 1px solid #e3ebe6;
    border-radius: 0.6rem;
    padding: 0.4rem 0.8rem;
    font-size: 1.25rem;
}

.item-img-wrap {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 0.4rem;
    overflow: hidden;
    flex-shrink: 0;
}

.item-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-name {
    font-weight: 600;
    color: #2c3e50;
    text-transform: capitalize;
}

.item-qty-tag {
    background: #e8f8f0;
    color: #27ae60;
    font-weight: 700;
    padding: 0.1rem 0.5rem;
    border-radius: 0.4rem;
    font-size: 1.15rem;
}

.item-price-tag {
    color: #7f8c8d;
    font-size: 1.15rem;
}

.col-total {
    width: 14%;
    white-space: nowrap;
}

.total-cell {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
}

.total-num {
    font-size: 1.6rem;
    font-weight: 700;
    color: #27ae60;
}

.total-currency {
    font-size: 1.2rem;
    color: #777;
    font-weight: 600;
}

.col-status {
    width: 14%;
    white-space: nowrap;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    border-radius: 2rem;
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: capitalize;
}

.status-completed {
    background: #e8f8f0;
    color: #27ae60;
    border: 1px solid #b7ebd0;
}

.status-active {
    background: #fff6e9;
    color: #f38609;
    border: 1px solid #fcdbb0;
}

.status-cancelled {
    background: #fdeeee;
    color: #e74c3c;
    border: 1px solid #f9c7c7;
}

/* Footer / Toggle View */
.history-footer {
    display: flex;
    justify-content: center;
    padding-top: 1.8rem;
    border-top: 1px solid #f0f2f5;
    margin-top: 1.5rem;
}

.toggle-view-btn {
    background: none;
    border: 1px solid #dcdfe6;
    padding: 0.7rem 1.6rem;
    border-radius: 0.8rem;
    font-size: 1.3rem;
    font-weight: 600;
    color: #4a5568;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
}

.toggle-view-btn:hover {
    background: #f8fafc;
    border-color: #27ae60;
    color: #27ae60;
}

/* Responsive */
@media (max-width: 768px) {
    .order-history-wrapper {
        padding: 1.6rem;
    }
    .history-header {
        flex-direction: column;
        align-items: flex-start;
    }
    .history-table th,
    .history-table td {
        padding: 1rem 0.8rem;
        font-size: 1.25rem;
    }
}
</style>
