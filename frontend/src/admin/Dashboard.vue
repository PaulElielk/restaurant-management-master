<template>
    <div class="admin-container">
        <div class="d-flex justify-content-between">
            <h1>Hello Admin!</h1>
            <button class="btn" @click="handleLogout()">Logout</button>
        </div>

        <div class="table-responsive">
            <!-- PROJECT TABLE -->
            <table class="table colored-header datatable project-list">
                <thead>
                    <tr>
                        <th>Bill Id</th>
                        <th>User Id</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>When</th>
                        <th>Paid</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(b) in filterBills.slice().reverse()" :key="b.bill_id">
                        <td>{{ b.bill_id }}</td>
                        <td>{{ b.user_id }}</td>
                        <td>{{ b.bill_phone }}</td>
                        <td>{{ b.bill_address }}</td>
                        <td>{{ b.bill_when }}</td>
                        <td>{{ b.bill_paid }}</td>
                        <td>Fcfa{{ b.bill_total }}</td>
                        <td>{{ avaiableStatus[b.bill_status] }}</td>
                        <td>
                            <button v-if="b.bill_status < 5" class="action-btn" @click="nextStatusBtn(b.bill_id)">
                                {{ avaiableStatus[b.bill_status + 1] }}
                            </button>

                            <button v-if="b.bill_status == 1" class="cancel-btn" @click="cancelBtn(b.bill_id)">
                                Cancel
                            </button>

                            <button v-else-if="b.bill_status == 5 && b.bill_paid == 'false'" class="paid-btn"
                                @click="paidBtn(b.bill_id)">
                                Paid
                            </button>

                            <button v-else-if="b.bill_status == 5 && b.bill_paid == 'true'" class="action-btn"
                                @click="nextStatusBtn(b.bill_id)">
                                {{ avaiableStatus[b.bill_status + 1] }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="table-responsive forecast-wrap">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h2 class="m-0">AI Demand Forecast (next {{ forecastDays }} days)</h2>
                <button class="btn" @click="getDemandForecast()">Refresh forecast</button>
            </div>
            <div class="forecast-summary">
                <span class="forecast-chip high">High: {{ forecastConfidenceCounts.high }}</span>
                <span class="forecast-chip medium">Medium: {{ forecastConfidenceCounts.medium }}</span>
                <span class="forecast-chip low">Low: {{ forecastConfidenceCounts.low }}</span>
            </div>

            <p v-if="forecastLoading">Loading forecast...</p>
            <table v-else class="table colored-header datatable project-list">
                <thead>
                    <tr>
                        <th>Food</th>
                        <th>Category</th>
                        <th>Predicted/Day</th>
                        <th>Predicted {{ forecastDays }} Days</th>
                        <th>Confidence</th>
                        <th>Model</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in displayForecastRows" :key="`f-${row.food_id}`">
                        <td>{{ row.food_name }}</td>
                        <td>{{ row.food_category }}</td>
                        <td>{{ row.predicted_daily_qty }}</td>
                        <td>{{ row.predicted_period_qty }}</td>
                        <td>{{ row.confidence_hint }}</td>
                        <td>{{ row.model }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script>
import axios from "axios";
import { mapState, mapMutations } from "vuex";
export default {
    name: 'Dashboard',

    data() {
        return {
            avaiableStatus: ["cancel", "confirmed", "preparing", "checking", "delivering", "delivered", "completed"],
            allBills: [],
            showOrderDetails: false,
            sendId: undefined,
            interval: "",
            forecastRows: [],
            forecastLoading: false,
            forecastDays: 7,
            forecastLookback: 30,
        }
    },

    // created() {
    //     this.getAllBills();
    //     if (!this.admin) {
    //         this.$router.push("/");
    //     }
    // },

    mounted: function () {
        this.getAllBills();
        this.getDemandForecast();
        if (!this.admin) {
            this.$router.push("/");
        }
        
        this.autoUpdate();
    },

    beforeUnmount() {
        clearInterval(this.interval)
    },

    computed: {
        ...mapState(["allFoods", "admin"]),

        filterBills: function () {
            return this.allBills.filter((b) => b.bill_status < 6 && b.bill_status > 0);
        },

        forecastConfidenceCounts: function () {
            return this.forecastRows.reduce((counts, row) => {
                const level = row.confidence_hint || "low";
                counts[level] = (counts[level] || 0) + 1;
                return counts;
            }, { high: 0, medium: 0, low: 0 });
        },

        displayForecastRows: function () {
            const selected = [];
            const seen = new Set();
            const addRows = (rows) => {
                rows.forEach((row) => {
                    if (!seen.has(row.food_id) && selected.length < 10) {
                        selected.push(row);
                        seen.add(row.food_id);
                    }
                });
            };

            addRows(this.forecastRows.filter((row) => row.confidence_hint === "high").slice(0, 6));
            addRows(this.forecastRows.filter((row) => row.confidence_hint === "medium").slice(0, 2));
            addRows(this.forecastRows.filter((row) => row.confidence_hint === "low").slice(0, 2));
            addRows(this.forecastRows);

            return selected;
        },
    },

    methods: {
        ...mapMutations(["setAdmin"]),

        async getAllBills() {
            this.allBills = (await axios.get('/billstatus')).data;
        },

        async getDemandForecast() {
            this.forecastLoading = true;
            try {
                const response = await axios.get(`/billstatus/forecast?days=${this.forecastDays}&lookback=${this.forecastLookback}`);
                this.forecastRows = Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                console.log(error);
                this.forecastRows = [];
            } finally {
                this.forecastLoading = false;
            }
        },

        sendBillId: function (id) {
            this.sendId = id
            this.showOrderDetails = !this.showOrderDetails;
        },

        closeView: function () {
            this.showOrderDetails = !this.showOrderDetails;
        },

        handleLogout: function () {
            this.setAdmin("");
        },

        async nextStatusBtn(id) {
            await axios.put('/billstatus/' + id);
            this.getAllBills();
        },

        async paidBtn(id) {
            await axios.put('/billstatus/paid/' + id);
            this.getAllBills();
        },

        async cancelBtn(id) {
            await axios.put('/billstatus/cancel/' + id);
            this.getAllBills();
        },

        autoUpdate: function () {
            this.interval = setInterval(function () {
                this.getAllBills();
                this.getDemandForecast();
            }.bind(this), 15000);
        }

    },
}
</script>

<style scoped>
.admin-container {
    background-color: #fff;
    height: 100vh;
    padding: 2rem 9%;
    font-size: 16px;
}

.project-list>tbody>tr>td {
    padding: 12px 8px;
}

.project-list>tbody>tr>td .avatar {
    width: 22px;
    border: 1px solid #CCC;
}

.table-responsive {
    margin-top: 8vh;
}

.forecast-wrap {
    margin-top: 3vh;
}

.forecast-summary {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.forecast-chip {
    border-radius: 4px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    padding: 5px 10px;
}

.forecast-chip.high {
    background-color: #16a34a;
}

.forecast-chip.medium {
    background-color: #f59e0b;
}

.forecast-chip.low {
    background-color: #dc2626;
}

.action-btn,
.cancel-btn,
.paid-btn {
    width: 100px;
    height: 25px;
    color: white;
    text-transform: capitalize;
}

.action-btn {
    background-color: #0da9ef;
    margin-right: 10px;
}

.cancel-btn,
.paid-btn {
    background-color: red;
}

.action-btn:hover {
    background-color: #27ae60;
}
</style>
