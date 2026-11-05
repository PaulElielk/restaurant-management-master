<template>
    <div class="admin-page-wrapper">
        <!-- 1. WEBSITE-ALIGNED NAVBAR -->
        <header class="admin-navbar">
            <router-link to="/" class="logo">
                <img src="../assets/images/taco-logo.png" alt="P&C's Kitchen" />P&C's Kitchen
            </router-link>

            <div class="navbar-center">
                <span class="admin-badge">Admin Dashboard</span>
                <span class="db-status">
                    <span class="pulsing-circle"></span> db_restaurant_v2 Connected
                </span>
            </div>

            <div class="navbar-actions">
                <router-link to="/" class="btn btn-website" title="Switch to Customer Website">
                    <i class="fas fa-store"></i>
                    <span>Customer Website</span>
                </router-link>
                <button class="btn btn-sync" :disabled="isRefreshing" @click="refreshAll()">
                    <i class="fas fa-rotate" :class="{ 'fa-spin': isRefreshing }"></i>
                    <span>Sync</span>
                </button>
                <button class="btn btn-signout" @click="handleLogout()">
                    <i class="fas fa-arrow-right-from-bracket"></i>
                    <span>Logout</span>
                </button>
            </div>
        </header>

        <main class="dashboard-body">
            <!-- 2. KPI METRIC SUMMARY CARDS -->
            <section class="kpi-row">
                <div class="kpi-card revenue-card">
                    <div class="kpi-icon"><i class="fas fa-sack-dollar"></i></div>
                    <div class="kpi-data">
                        <span class="kpi-label">Total Realized Revenue</span>
                        <h3 class="kpi-number">Fcfa {{ formatPrice(totalRevenue) }}</h3>
                        <span class="kpi-caption">From completed & settled orders</span>
                    </div>
                </div>

                <div class="kpi-card active-card">
                    <div class="kpi-icon"><i class="fas fa-fire-burner"></i></div>
                    <div class="kpi-data">
                        <span class="kpi-label">Active Kitchen Orders</span>
                        <h3 class="kpi-number">{{ activeCount }}</h3>
                        <span class="kpi-caption">In preparation & delivery stages</span>
                    </div>
                </div>

                <div class="kpi-card completed-card">
                    <div class="kpi-icon"><i class="fas fa-circle-check"></i></div>
                    <div class="kpi-data">
                        <span class="kpi-label">Completed Orders</span>
                        <h3 class="kpi-number">{{ formatPrice(completedCount) }}</h3>
                        <span class="kpi-caption">Successfully delivered & closed</span>
                    </div>
                </div>

                <div class="kpi-card forecast-card">
                    <div class="kpi-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="kpi-data">
                        <span class="kpi-label">Catalog Menu Items</span>
                        <h3 class="kpi-number">{{ forecastRows.length }} Items</h3>
                        <span class="kpi-caption">{{ forecastConfidenceCounts.high }} with high demand velocity</span>
                    </div>
                </div>
            </section>

            <!-- 3. LIVE KITCHEN & ORDER DISPATCH PANEL -->
            <section class="admin-panel">
                <div class="panel-heading-bar">
                    <div class="section-heading">
                        <span class="sub-title">Live Kitchen</span>
                        <h2>Order Dispatch & Fulfillment</h2>
                    </div>

                    <!-- SEARCH BAR -->
                    <div class="search-wrap">
                        <i class="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            v-model="searchQuery"
                            placeholder="Search by Bill ID, Phone, Address..."
                            class="search-input"
                        />
                        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- STATUS FILTER TABS -->
                <div class="order-toolbar">
                    <div class="filter-tabs">
                        <button
                            class="tab-btn"
                            :class="{ active: statusFilter === 'active' }"
                            @click="setFilter('active')"
                        >
                            <i class="fas fa-clock"></i> Active Orders
                            <span class="badge">{{ activeCount }}</span>
                        </button>
                        <button
                            class="tab-btn"
                            :class="{ active: statusFilter === 'completed' }"
                            @click="setFilter('completed')"
                        >
                            <i class="fas fa-check-double"></i> Completed
                            <span class="badge">{{ completedCount }}</span>
                        </button>
                        <button
                            class="tab-btn"
                            :class="{ active: statusFilter === 'cancelled' }"
                            @click="setFilter('cancelled')"
                        >
                            <i class="fas fa-ban"></i> Cancelled
                            <span class="badge">{{ cancelledCount }}</span>
                        </button>
                        <button
                            class="tab-btn"
                            :class="{ active: statusFilter === 'all' }"
                            @click="setFilter('all')"
                        >
                            <i class="fas fa-layer-group"></i> All Orders
                            <span class="badge">{{ allBills.length }}</span>
                        </button>
                    </div>

                    <div class="page-size-wrap">
                        <label for="pageSize">Rows per page:</label>
                        <select id="pageSize" v-model.number="pageSize" class="select-box">
                            <option :value="10">10</option>
                            <option :value="25">25</option>
                            <option :value="50">50</option>
                        </select>
                    </div>
                </div>

                <!-- ORDERS TABLE -->
                <div class="table-scroll">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Bill ID</th>
                                <th>Customer</th>
                                <th>Delivery Address</th>
                                <th>Order Time</th>
                                <th>Payment</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th class="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="b in paginatedBills" :key="b.bill_id">
                                <td>
                                    <span class="bill-id-badge">#{{ b.bill_id }}</span>
                                </td>
                                <td>
                                    <div class="customer-cell">
                                        <span class="cust-name">User #{{ b.user_id }}</span>
                                        <span class="cust-phone"><i class="fas fa-phone-alt"></i> {{ b.bill_phone }}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="address-cell" :title="b.bill_address">
                                        <i class="fas fa-location-dot"></i> {{ b.bill_address }}
                                    </div>
                                </td>
                                <td>
                                    <span class="when-cell">{{ formatDate(b.bill_when) }}</span>
                                </td>
                                <td>
                                    <span
                                        class="paid-pill"
                                        :class="b.bill_paid === 'true' ? 'paid-yes' : 'paid-no'"
                                    >
                                        <i :class="b.bill_paid === 'true' ? 'fas fa-check' : 'fas fa-clock'"></i>
                                        {{ b.bill_paid === 'true' ? 'Paid' : 'Unpaid' }}
                                    </span>
                                </td>
                                <td>
                                    <span class="total-cell">Fcfa {{ formatPrice(b.bill_total) }}</span>
                                </td>
                                <td>
                                    <span class="status-pill" :class="statusClass(b.bill_status)">
                                        <span class="status-dot"></span>
                                        {{ availableStatus[b.bill_status] || 'Unknown' }}
                                    </span>
                                </td>
                                <td class="text-right">
                                    <div class="action-buttons">
                                        <button
                                            v-if="b.bill_status < 5"
                                            class="btn btn-advance"
                                            @click="nextStatusBtn(b.bill_id)"
                                            :title="`Advance to ${availableStatus[b.bill_status + 1]}`"
                                        >
                                            <span>{{ availableStatus[b.bill_status + 1] }}</span>
                                            <i class="fas fa-arrow-right"></i>
                                        </button>

                                        <button
                                            v-if="b.bill_status == 1"
                                            class="btn btn-cancel-order"
                                            @click="cancelBtn(b.bill_id)"
                                            title="Cancel Order"
                                        >
                                            <i class="fas fa-times"></i> Cancel
                                        </button>

                                        <button
                                            v-else-if="b.bill_status == 5 && b.bill_paid == 'false'"
                                            class="btn btn-mark-paid"
                                            @click="paidBtn(b.bill_id)"
                                            title="Mark Paid"
                                        >
                                            <i class="fas fa-dollar-sign"></i> Paid
                                        </button>

                                        <button
                                            v-else-if="b.bill_status == 5 && b.bill_paid == 'true'"
                                            class="btn btn-complete-order"
                                            @click="nextStatusBtn(b.bill_id)"
                                            title="Complete Order"
                                        >
                                            <i class="fas fa-check-circle"></i> Complete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="paginatedBills.length === 0">
                                <td colspan="8" class="no-records-cell">
                                    <i class="fas fa-inbox no-records-icon"></i>
                                    <p>No orders found for the current selection.</p>
                                    <button v-if="searchQuery" class="btn btn-clear-search" @click="searchQuery = ''">
                                        Clear Search Query
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- PAGINATION BAR -->
                <div class="pagination-bar">
                    <div class="pagination-summary">
                        <span v-if="filterBills.length > 0">
                            Showing <strong>{{ (currentPage - 1) * pageSize + 1 }}</strong> to
                            <strong>{{ Math.min(currentPage * pageSize, filterBills.length) }}</strong> of
                            <strong>{{ filterBills.length }}</strong> orders
                        </span>
                        <span v-else>0 orders found</span>
                    </div>

                    <div v-if="totalPages > 1" class="pagination-nav">
                        <button
                            class="page-btn"
                            :disabled="currentPage === 1"
                            @click="prevPage()"
                        >
                            <i class="fas fa-chevron-left"></i> Previous
                        </button>
                        <span class="page-current">Page {{ currentPage }} of {{ totalPages }}</span>
                        <button
                            class="page-btn"
                            :disabled="currentPage === totalPages"
                            @click="nextPage()"
                        >
                            Next <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </section>

            <!-- 4. AI DEMAND FORECAST SECTION -->
            <section class="admin-panel forecast-panel">
                <div class="panel-heading-bar">
                    <div class="section-heading">
                        <span class="sub-title">Inventory & Kitchen Prep</span>
                        <h2>AI Demand Velocity Forecast</h2>
                    </div>

                    <!-- FORECAST CONTROLS -->
                    <div class="forecast-settings">
                        <div class="setting-item">
                            <label for="fDays">Horizon:</label>
                            <select id="fDays" v-model.number="forecastDays" @change="getDemandForecast()" class="select-box">
                                <option :value="7">7 Days</option>
                                <option :value="14">14 Days</option>
                                <option :value="30">30 Days</option>
                            </select>
                        </div>

                        <div class="setting-item">
                            <label for="fLook">Lookback:</label>
                            <select id="fLook" v-model.number="forecastLookback" @change="getDemandForecast()" class="select-box">
                                <option :value="14">14 Days</option>
                                <option :value="30">30 Days</option>
                                <option :value="60">60 Days</option>
                            </select>
                        </div>

                        <div class="setting-item">
                            <label for="fLimit">Display:</label>
                            <select id="fLimit" v-model="forecastLimit" class="select-box">
                                <option :value="10">Top 10 Dishes</option>
                                <option :value="25">Top 25 Dishes</option>
                                <option :value="74">All 74 Catalog Items</option>
                            </select>
                        </div>

                        <button class="btn btn-sync" :disabled="forecastLoading" @click="getDemandForecast()">
                            <i class="fas fa-rotate" :class="{ 'fa-spin': forecastLoading }"></i>
                            <span>Update</span>
                        </button>
                    </div>
                </div>

                <!-- CONFIDENCE CHIPS -->
                <div class="confidence-summary-bar">
                    <div class="conf-chip conf-high-chip">
                        <i class="fas fa-circle-check"></i>
                        <span>High Confidence: <strong>{{ forecastConfidenceCounts.high }}</strong> dishes</span>
                    </div>
                    <div class="conf-chip conf-medium-chip">
                        <i class="fas fa-circle-minus"></i>
                        <span>Medium Confidence: <strong>{{ forecastConfidenceCounts.medium }}</strong> dishes</span>
                    </div>
                    <div class="conf-chip conf-low-chip">
                        <i class="fas fa-triangle-exclamation"></i>
                        <span>Low Support: <strong>{{ forecastConfidenceCounts.low }}</strong> dishes</span>
                    </div>
                </div>

                <!-- FORECAST TABLE -->
                <div class="table-scroll">
                    <div v-if="forecastLoading" class="loading-box">
                        <i class="fas fa-spinner fa-spin loading-icon"></i>
                        <p>Computing recent order velocity across database catalog...</p>
                    </div>

                    <table v-else class="admin-table forecast-table">
                        <thead>
                            <tr>
                                <th>Menu Item</th>
                                <th>Category</th>
                                <th>Predicted Daily Velocity</th>
                                <th>Predicted {{ forecastDays }}-Day Demand</th>
                                <th>Confidence Rating</th>
                                <th>Model</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in displayForecastRows" :key="`f-${row.food_id}`">
                                <td>
                                    <strong class="dish-name">{{ row.food_name }}</strong>
                                </td>
                                <td>
                                    <span class="category-tag">{{ row.food_category || 'General' }}</span>
                                </td>
                                <td>
                                    <div class="velocity-value">
                                        <span class="vel-num">{{ row.predicted_daily_qty }}</span>
                                        <span class="vel-unit">units/day</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="period-demand-badge">
                                        {{ row.predicted_period_qty }} units
                                    </span>
                                </td>
                                <td>
                                    <span class="conf-pill" :class="`conf-level-${row.confidence_hint}`">
                                        <i :class="confidenceIcon(row.confidence_hint)"></i>
                                        {{ (row.confidence_hint || 'low').toUpperCase() }}
                                    </span>
                                </td>
                                <td>
                                    <span class="model-tag">Moving Avg Velocity</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>
</template>

<script>
import axios from "axios";
import { mapState, mapMutations } from "vuex";

export default {
    name: "Dashboard",

    data() {
        return {
            availableStatus: ["cancel", "confirmed", "preparing", "checking", "delivering", "delivered", "completed"],
            allBills: [],
            statusFilter: "active",
            searchQuery: "",
            currentPage: 1,
            pageSize: 10,
            interval: "",
            isRefreshing: false,

            // AI Forecast State
            forecastRows: [],
            forecastLoading: false,
            forecastDays: 7,
            forecastLookback: 30,
            forecastLimit: 10,
        };
    },

    mounted() {
        this.getAllBills();
        this.getDemandForecast();
        if (!this.admin) {
            this.$router.push("/");
        }
        this.autoUpdate();
    },

    beforeUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    },

    computed: {
        ...mapState(["allFoods", "admin"]),

        totalRevenue() {
            return this.allBills
                .filter((b) => b.bill_status === 6 || b.bill_paid === "true")
                .reduce((sum, b) => sum + (Number(b.bill_total) || 0), 0);
        },

        activeCount() {
            return this.allBills.filter((b) => b.bill_status < 6 && b.bill_status > 0).length;
        },

        completedCount() {
            return this.allBills.filter((b) => b.bill_status === 6).length;
        },

        cancelledCount() {
            return this.allBills.filter((b) => b.bill_status === 0).length;
        },

        filterBills() {
            let list = this.allBills.slice().reverse();

            if (this.statusFilter === "active") {
                list = list.filter((b) => b.bill_status < 6 && b.bill_status > 0);
            } else if (this.statusFilter === "completed") {
                list = list.filter((b) => b.bill_status === 6);
            } else if (this.statusFilter === "cancelled") {
                list = list.filter((b) => b.bill_status === 0);
            }

            if (this.searchQuery.trim()) {
                const q = this.searchQuery.trim().toLowerCase();
                list = list.filter((b) =>
                    String(b.bill_id).includes(q) ||
                    String(b.user_id).includes(q) ||
                    String(b.bill_phone || "").toLowerCase().includes(q) ||
                    String(b.bill_address || "").toLowerCase().includes(q)
                );
            }

            return list;
        },

        totalPages() {
            return Math.ceil(this.filterBills.length / this.pageSize) || 1;
        },

        paginatedBills() {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.filterBills.slice(start, start + this.pageSize);
        },

        forecastConfidenceCounts() {
            return this.forecastRows.reduce(
                (counts, row) => {
                    const level = row.confidence_hint || "low";
                    counts[level] = (counts[level] || 0) + 1;
                    return counts;
                },
                { high: 0, medium: 0, low: 0 }
            );
        },

        displayForecastRows() {
            if (this.forecastLimit === 74 || this.forecastLimit === "all") {
                return this.forecastRows;
            }
            return this.forecastRows.slice(0, Number(this.forecastLimit) || 10);
        },
    },

    watch: {
        statusFilter() {
            this.currentPage = 1;
        },
        searchQuery() {
            this.currentPage = 1;
        },
        pageSize() {
            this.currentPage = 1;
        },
    },

    methods: {
        ...mapMutations(["setAdmin"]),

        setFilter(filter) {
            this.statusFilter = filter;
            this.currentPage = 1;
        },

        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },

        formatPrice(val) {
            return Number(val || 0).toLocaleString();
        },

        formatDate(dateStr) {
            if (!dateStr) return "-";
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return String(dateStr).replace("T", " ");
            }
            return date.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        },

        statusClass(status) {
            const map = {
                0: "status-cancelled",
                1: "status-confirmed",
                2: "status-preparing",
                3: "status-checking",
                4: "status-delivering",
                5: "status-delivered",
                6: "status-completed",
            };
            return map[status] || "status-default";
        },

        confidenceIcon(hint) {
            if (hint === "high") return "fas fa-circle-check";
            if (hint === "medium") return "fas fa-circle-minus";
            return "fas fa-triangle-exclamation";
        },

        async refreshAll() {
            this.isRefreshing = true;
            try {
                await Promise.all([this.getAllBills(), this.getDemandForecast()]);
            } finally {
                setTimeout(() => {
                    this.isRefreshing = false;
                }, 400);
            }
        },

        async getAllBills() {
            try {
                const response = await axios.get("/billstatus");
                this.allBills = Array.isArray(response.data) ? response.data : [];
            } catch (err) {
                console.error("Failed to load bills:", err);
            }
        },

        async getDemandForecast() {
            this.forecastLoading = true;
            try {
                const response = await axios.get(
                    `/billstatus/forecast?days=${this.forecastDays}&lookback=${this.forecastLookback}`
                );
                this.forecastRows = Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                console.error("Forecast fetch error:", error);
                this.forecastRows = [];
            } finally {
                this.forecastLoading = false;
            }
        },

        handleLogout() {
            this.setAdmin("");
            this.$router.push("/admin");
        },

        async nextStatusBtn(id) {
            await axios.put("/billstatus/" + id);
            this.getAllBills();
        },

        async paidBtn(id) {
            await axios.put("/billstatus/paid/" + id);
            this.getAllBills();
        },

        async cancelBtn(id) {
            if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                return;
            }
            await axios.put("/billstatus/cancel/" + id);
            this.getAllBills();
        },

        autoUpdate() {
            this.interval = setInterval(() => {
                this.getAllBills();
            }, 20000);
        },
    },
};
</script>

<style scoped>
/* WRAPPER AND OVERALL STRUCTURE (Note: html { font-size: 62.5% } => 1rem = 10px) */
.admin-page-wrapper {
    background-color: #fff;
    min-height: 100vh;
    padding-bottom: 6rem;
    font-size: 1.6rem;
    color: #130f40;
}

/* NAVBAR (matching NavBar.vue style) */
.admin-navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: #fff;
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 9%;
    border-bottom: 0.1rem solid #eee;
}

.admin-navbar .logo {
    font-size: 2.5rem;
    font-weight: bolder;
    color: #130f40;
    text-decoration: none;
    display: flex;
    align-items: center;
}

.admin-navbar .logo img {
    padding-right: 0.8rem;
    height: 4rem;
    width: auto;
}

.navbar-center {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.admin-badge {
    font-size: 1.5rem;
    font-weight: 600;
    background: #eafaf1;
    color: #27ae60;
    padding: 0.6rem 1.4rem;
    border-radius: 0.5rem;
    border: 0.1rem solid #d5f5e3;
}

.db-status {
    font-size: 1.4rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.pulsing-circle {
    width: 1rem;
    height: 1rem;
    background: #27ae60;
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7);
    }
    70% {
        box-shadow: 0 0 0 0.8rem rgba(39, 174, 96, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(39, 174, 96, 0);
    }
}

.navbar-actions {
    display: flex;
    align-items: center;
    gap: 1.2rem;
}

.btn-website {
    background: #130f40;
    color: #fff;
    padding: 0.8rem 1.8rem;
    font-size: 1.5rem;
    border-radius: 0.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    text-decoration: none;
    font-weight: 500;
    transition: 0.2s linear;
}

.btn-website:hover {
    background: #27ae60;
    color: #fff;
}

.btn-sync {
    background: #27ae60;
    color: #fff;
    padding: 0.8rem 1.8rem;
    font-size: 1.6rem;
    border-radius: 0.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    border: none;
    transition: 0.2s linear;
}

.btn-sync:hover {
    background: #f38609;
    color: #fff;
}

.btn-signout {
    background: #e74c3c;
    color: #fff;
    padding: 0.8rem 1.8rem;
    font-size: 1.6rem;
    border-radius: 0.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    border: none;
    transition: 0.2s linear;
}

.btn-signout:hover {
    background: #c0392b;
    color: #fff;
}

/* DASHBOARD BODY */
.dashboard-body {
    padding: 3rem 9% 0 9%;
}

/* 2. KPI METRIC SUMMARY CARDS */
.kpi-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(26rem, 1fr));
    gap: 2rem;
    margin-bottom: 3.5rem;
}

.kpi-card {
    background: #fff;
    border: 0.1rem solid #e1e7ec;
    border-radius: 0.8rem;
    padding: 2.2rem 2rem;
    display: flex;
    align-items: center;
    gap: 1.8rem;
    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.05);
    transition: 0.2s linear;
}

.kpi-card:hover {
    transform: translateY(-0.4rem);
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.08);
}

.kpi-icon {
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.6rem;
    flex-shrink: 0;
}

.revenue-card .kpi-icon {
    background: #eafaf1;
    color: #27ae60;
}

.active-card .kpi-icon {
    background: #fef5e7;
    color: #f38609;
}

.completed-card .kpi-icon {
    background: #edf2f7;
    color: #130f40;
}

.forecast-card .kpi-icon {
    background: #ebf5fb;
    color: #2980b9;
}

.kpi-data {
    display: flex;
    flex-direction: column;
}

.kpi-label {
    font-size: 1.4rem;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05rem;
}

.kpi-number {
    font-size: 2.8rem;
    font-weight: 700;
    color: #130f40;
    margin: 0.3rem 0;
}

.kpi-caption {
    font-size: 1.3rem;
    color: #888;
}

/* 3. PANELS */
.admin-panel {
    background: #fff;
    border: 0.1rem solid #e1e7ec;
    border-radius: 0.8rem;
    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.05);
    margin-bottom: 4rem;
    overflow: hidden;
}

.panel-heading-bar {
    padding: 2.2rem 2.5rem 1.8rem 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 0.1rem solid #eee;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.section-heading .sub-title {
    font-family: "Satisfy", cursive;
    font-size: 2.6rem;
    color: #27ae60;
    display: block;
    line-height: 1.2;
}

.section-heading h2 {
    font-size: 2.6rem;
    font-weight: 700;
    color: #130f40;
    margin: 0;
}

/* SEARCH WRAP */
.search-wrap {
    position: relative;
    width: 100%;
    max-width: 38rem;
}

.search-icon {
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.8rem;
    color: #888;
}

.search-input {
    width: 100%;
    background: #f7f7f7;
    border: 0.1rem solid #ddd;
    border-radius: 0.6rem;
    padding: 1.1rem 2rem 1.1rem 4.5rem;
    font-size: 1.6rem;
    color: #130f40;
    text-transform: none;
    transition: 0.2s linear;
}

.search-input:focus {
    background: #fff;
    border-color: #27ae60;
    box-shadow: 0 0 0 0.3rem rgba(39, 174, 96, 0.15);
}

.search-clear {
    position: absolute;
    right: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 1.6rem;
    color: #888;
    cursor: pointer;
}

/* TOOLBAR & TABS */
.order-toolbar {
    padding: 1.5rem 2.5rem;
    background: #fafafa;
    border-bottom: 0.1rem solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.filter-tabs {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.tab-btn {
    background: #fff;
    border: 0.1rem solid #ddd;
    color: #130f40;
    padding: 0.9rem 1.8rem;
    border-radius: 0.6rem;
    font-size: 1.5rem;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    transition: 0.2s linear;
}

.tab-btn:hover {
    background: #fef5e7;
    color: #f38609;
    border-color: #f38609;
}

.tab-btn.active {
    background: #27ae60;
    color: #fff;
    border-color: #27ae60;
    box-shadow: 0 0.4rem 1rem rgba(39, 174, 96, 0.2);
}

.tab-btn .badge {
    background: rgba(0, 0, 0, 0.08);
    color: inherit;
    font-size: 1.3rem;
    padding: 0.2rem 0.8rem;
    border-radius: 1rem;
}

.tab-btn.active .badge {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
}

.page-size-wrap {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.5rem;
    color: #666;
}

.select-box {
    background: #fff;
    border: 0.1rem solid #ddd;
    border-radius: 0.5rem;
    padding: 0.7rem 1.2rem;
    font-size: 1.5rem;
    color: #130f40;
    cursor: pointer;
}

/* TABLE STYLING */
.table-scroll {
    overflow-x: auto;
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 1.5rem;
    text-align: left;
}

.admin-table thead {
    background: #f9f9f9;
    border-bottom: 0.2rem solid #e1e7ec;
}

.admin-table th {
    padding: 1.6rem 1.6rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: #130f40;
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    white-space: nowrap;
}

.admin-table td {
    padding: 1.6rem 1.6rem;
    border-bottom: 0.1rem solid #eee;
    vertical-align: middle;
    color: #130f40;
}

.admin-table tbody tr:hover {
    background-color: #fdfefe;
}

.bill-id-badge {
    font-family: monospace;
    font-weight: 700;
    font-size: 1.5rem;
    color: #27ae60;
    background: #eafaf1;
    border: 0.1rem solid #d5f5e3;
    padding: 0.4rem 0.9rem;
    border-radius: 0.5rem;
}

.customer-cell {
    display: flex;
    flex-direction: column;
}

.cust-name {
    font-weight: 600;
    color: #130f40;
    font-size: 1.6rem;
}

.cust-phone {
    font-size: 1.4rem;
    color: #666;
}

.address-cell {
    max-width: 26rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.4rem;
    color: #555;
}

.address-cell i {
    color: #888;
    margin-right: 0.4rem;
}

.when-cell {
    font-size: 1.4rem;
    color: #666;
    white-space: nowrap;
}

.paid-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1.2rem;
    border-radius: 2rem;
    font-size: 1.3rem;
    font-weight: 600;
    text-transform: uppercase;
}

.paid-yes {
    background: #eafaf1;
    color: #27ae60;
    border: 0.1rem solid #d5f5e3;
}

.paid-no {
    background: #fef5e7;
    color: #f38609;
    border: 0.1rem solid #fae5d3;
}

.total-cell {
    font-weight: 700;
    font-size: 1.7rem;
    color: #130f40;
    white-space: nowrap;
}

/* STATUS PILLS */
.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 1.4rem;
    border-radius: 2rem;
    font-size: 1.4rem;
    font-weight: 600;
    text-transform: capitalize;
}

.status-dot {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    background-color: currentColor;
}

.status-confirmed {
    background: #f2f4f4;
    color: #566573;
}

.status-preparing {
    background: #fef5e7;
    color: #f38609;
    border: 0.1rem solid #fae5d3;
}

.status-checking {
    background: #ebf5fb;
    color: #2980b9;
    border: 0.1rem solid #d4e6f1;
}

.status-delivering {
    background: #f4ecf7;
    color: #8e44ad;
    border: 0.1rem solid #e8daef;
}

.status-delivered {
    background: #eafaf1;
    color: #27ae60;
    border: 0.1rem solid #d5f5e3;
}

.status-completed {
    background: #eafaf1;
    color: #27ae60;
    border: 0.1rem solid #a9dfbf;
}

.status-cancelled {
    background: #fdedec;
    color: #e74c3c;
    border: 0.1rem solid #fadbd8;
}

/* ACTIONS */
.action-buttons {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
}

.btn-advance {
    background: #27ae60;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    padding: 0.8rem 1.6rem;
    border-radius: 0.5rem;
    cursor: pointer;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    text-transform: capitalize;
    transition: 0.2s linear;
}

.btn-advance:hover {
    background: #f38609;
    color: #fff;
}

.btn-cancel-order {
    background: #e74c3c;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    padding: 0.8rem 1.4rem;
    border-radius: 0.5rem;
    cursor: pointer;
    border: none;
    transition: 0.2s linear;
}

.btn-cancel-order:hover {
    background: #c0392b;
    color: #fff;
}

.btn-mark-paid {
    background: #f38609;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    padding: 0.8rem 1.4rem;
    border-radius: 0.5rem;
    cursor: pointer;
    border: none;
    transition: 0.2s linear;
}

.btn-mark-paid:hover {
    background: #d35400;
    color: #fff;
}

.btn-complete-order {
    background: #27ae60;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    padding: 0.8rem 1.4rem;
    border-radius: 0.5rem;
    cursor: pointer;
    border: none;
    transition: 0.2s linear;
}

.btn-complete-order:hover {
    background: #1e8449;
    color: #fff;
}

.text-right {
    text-align: right;
}

/* NO RECORDS */
.no-records-cell {
    text-align: center;
    padding: 4rem 2rem !important;
    color: #888;
}

.no-records-icon {
    font-size: 3.5rem;
    color: #bbb;
    margin-bottom: 1rem;
}

.btn-clear-search {
    background: #f7f7f7;
    color: #130f40;
    border: 0.1rem solid #ddd;
    font-size: 1.4rem;
    padding: 0.6rem 1.4rem;
    border-radius: 0.5rem;
    cursor: pointer;
    margin-top: 1rem;
}

/* PAGINATION FOOTER */
.pagination-bar {
    padding: 1.8rem 2.5rem;
    background: #fff;
    border-top: 0.1rem solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.pagination-summary {
    font-size: 1.5rem;
    color: #666;
}

.pagination-nav {
    display: flex;
    align-items: center;
    gap: 1.2rem;
}

.page-btn {
    background: #fff;
    border: 0.1rem solid #ddd;
    color: #130f40;
    border-radius: 0.5rem;
    padding: 0.8rem 1.6rem;
    font-size: 1.5rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    transition: 0.2s linear;
}

.page-btn:hover:not(:disabled) {
    background: #27ae60;
    color: #fff;
    border-color: #27ae60;
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.page-current {
    font-size: 1.5rem;
    font-weight: 600;
    color: #130f40;
}

/* 4. AI DEMAND FORECAST SECTION */
.forecast-panel {
    border-top: 0.4rem solid #27ae60;
}

.forecast-settings {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    flex-wrap: wrap;
}

.setting-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.5rem;
    color: #130f40;
}

.setting-item label {
    margin: 0;
    font-weight: 600;
}

.confidence-summary-bar {
    background: #fafafa;
    border-bottom: 0.1rem solid #eee;
    padding: 1.5rem 2.5rem;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.conf-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 1.6rem;
    border-radius: 0.6rem;
    font-size: 1.5rem;
    font-weight: 500;
}

.conf-high-chip {
    background: #eafaf1;
    color: #27ae60;
    border: 0.1rem solid #d5f5e3;
}

.conf-medium-chip {
    background: #fef5e7;
    color: #f38609;
    border: 0.1rem solid #fae5d3;
}

.conf-low-chip {
    background: #fdedec;
    color: #e74c3c;
    border: 0.1rem solid #fadbd8;
}

.dish-name {
    font-size: 1.6rem;
    font-weight: 600;
    color: #130f40;
}

.category-tag {
    background: #f7f7f7;
    color: #666;
    padding: 0.4rem 1.2rem;
    border-radius: 0.5rem;
    font-size: 1.4rem;
    text-transform: capitalize;
}

.velocity-value {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.vel-num {
    font-size: 1.7rem;
    font-weight: 700;
    color: #130f40;
}

.vel-unit {
    font-size: 1.3rem;
    color: #888;
}

.period-demand-badge {
    background: #eafaf1;
    color: #27ae60;
    font-weight: 700;
    font-size: 1.6rem;
    padding: 0.4rem 1.2rem;
    border-radius: 0.5rem;
    border: 0.1rem solid #d5f5e3;
    display: inline-block;
}

.conf-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 1.2rem;
    border-radius: 2rem;
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.05rem;
}

.conf-level-high {
    background: #d4efdf;
    color: #1e8449;
}

.conf-level-medium {
    background: #fdebd0;
    color: #b9770e;
}

.conf-level-low {
    background: #fadbd8;
    color: #922b21;
}

.model-tag {
    font-size: 1.3rem;
    background: #f0f0f0;
    color: #666;
    padding: 0.4rem 0.9rem;
    border-radius: 0.4rem;
}

.loading-box {
    text-align: center;
    padding: 4rem;
    color: #666;
}

.loading-icon {
    font-size: 3rem;
    color: #27ae60;
    margin-bottom: 1rem;
}

/* RESPONSIVE */
@media (max-width: 992px) {
    .admin-navbar {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
    }
    .navbar-center,
    .navbar-actions {
        width: 100%;
        justify-content: space-between;
    }
    .panel-heading-bar {
        flex-direction: column;
        align-items: flex-start;
    }
    .search-wrap {
        max-width: 100%;
    }
}
</style>
