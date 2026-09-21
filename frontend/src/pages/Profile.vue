<template>
    <div class="profile-container">
        <div class="heading">
            <span>my account</span>
            <h3>personal details</h3>
        </div>

        <!-- Logged In State -->
        <div v-if="user && user.user_id" class="profile-content">
            <!-- Hero User Card -->
            <div class="user-hero-card">
                <div class="avatar-box">
                    <div class="avatar-circle">
                        <i class="fa-solid fa-user-check"></i>
                    </div>
                </div>

                <div class="user-hero-info">
                    <div class="user-title-row">
                        <h2>{{ profile.user_name || user.user_name || 'Customer' }}</h2>
                        <span class="badge-status">
                            <i class="fa-solid fa-shield-check"></i> Verified Diner
                        </span>
                    </div>
                    <p class="user-id-text">
                        <i class="fa-solid fa-id-card"></i> Member ID: #{{ profile.user_id || user.user_id }}
                    </p>
                </div>

                <div class="user-hero-stats">
                    <div class="stat-pill">
                        <i class="fa-solid fa-receipt"></i>
                        <div class="stat-meta">
                            <span class="stat-val">{{ orderCount }}</span>
                            <span class="stat-lbl">Orders</span>
                        </div>
                    </div>
                    <div class="stat-pill">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <div class="stat-meta">
                            <span class="stat-val">{{ cartItemCount }}</span>
                            <span class="stat-lbl">In Cart</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Details Grid -->
            <div class="details-section">
                <div class="section-title">
                    <h4>Account Information</h4>
                    <span class="subtitle">Your saved personal credentials and contact info</span>
                </div>

                <div class="info-grid">
                    <!-- Full Name -->
                    <div class="info-card">
                        <div class="icon-wrap">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div class="info-body">
                            <label>Full Name</label>
                            <div class="info-value">{{ profile.user_name || user.user_name || 'Not provided' }}</div>
                        </div>
                    </div>

                    <!-- Email Address -->
                    <div class="info-card">
                        <div class="icon-wrap">
                            <i class="fa-solid fa-envelope"></i>
                        </div>
                        <div class="info-body">
                            <label>Email Address</label>
                            <div class="info-value lowercase">{{ profile.user_email || user.user_email || 'Not provided' }}</div>
                        </div>
                    </div>

                    <!-- Phone Number -->
                    <div class="info-card">
                        <div class="icon-wrap">
                            <i class="fa-solid fa-phone"></i>
                        </div>
                        <div class="info-body">
                            <label>Phone Number</label>
                            <div class="info-value">{{ profile.user_phone || user.user_phone || 'Not provided' }}</div>
                        </div>
                    </div>

                    <!-- Date of Birth -->
                    <div class="info-card">
                        <div class="icon-wrap">
                            <i class="fa-solid fa-cake-candles"></i>
                        </div>
                        <div class="info-body">
                            <label>Date of Birth</label>
                            <div class="info-value">{{ formattedBirth }}</div>
                        </div>
                    </div>

                    <!-- Gender -->
                    <div class="info-card">
                        <div class="icon-wrap">
                            <i class="fa-solid fa-venus-mars"></i>
                        </div>
                        <div class="info-body">
                            <label>Gender</label>
                            <div class="info-value capitalize">{{ profile.user_gender || user.user_gender || 'Not specified' }}</div>
                        </div>
                    </div>

                    <!-- Member Status -->
                    <div class="info-card">
                        <div class="icon-wrap">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <div class="info-body">
                            <label>Membership Status</label>
                            <div class="info-value highlight">Active Account</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Action Navigation Links -->
            <div class="actions-section">
                <div class="section-title">
                    <h4>Quick Actions</h4>
                </div>

                <div class="action-buttons-wrap">
                    <router-link to="/myorder" class="btn action-btn">
                        <i class="fa-solid fa-clock-rotate-left"></i> View Order History
                    </router-link>

                    <router-link to="/menu" class="btn action-btn btn-accent">
                        <i class="fa-solid fa-utensils"></i> Explore Menu
                    </router-link>

                    <router-link to="/table" class="btn action-btn btn-outline">
                        <i class="fa-solid fa-chair"></i> Reserve a Table
                    </router-link>

                    <button @click="onLogout" class="btn action-btn btn-danger">
                        <i class="fa-solid fa-right-from-bracket"></i> Log Out
                    </button>
                </div>
            </div>
        </div>

        <!-- Not Logged In State -->
        <div v-else class="not-logged-card">
            <div class="lock-icon-wrap">
                <i class="fa-solid fa-user-lock"></i>
            </div>
            <h3>You are not signed in</h3>
            <p>Please log in or register to access your personal profile, order history, and restaurant preferences.</p>
            <div class="auth-btn-row">
                <router-link to="/login" class="btn">
                    <i class="fa-solid fa-right-to-bracket"></i> Log In
                </router-link>
                <router-link to="/register" class="btn btn-secondary-outline">
                    <i class="fa-solid fa-user-plus"></i> Create Account
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { mapState, mapMutations } from "vuex";

export default {
    name: "Profile",

    data() {
        return {
            profile: {},
            orderCount: 0,
            loading: false
        };
    },

    computed: {
        ...mapState(["user", "cartItemCount"]),

        formattedBirth() {
            const b = this.profile.user_birth || (this.user && this.user.user_birth);
            if (!b) return "Not provided";
            try {
                const date = new Date(b);
                if (isNaN(date.getTime())) return b;
                return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
            } catch (e) {
                return b;
            }
        }
    },

    watch: {
        user: {
            immediate: true,
            handler(val) {
                if (val && val.user_id) {
                    this.loadProfileDetails();
                }
            }
        }
    },

    mounted() {
        window.scrollTo(0, 0);
        if (this.user && this.user.user_id) {
            this.loadProfileDetails();
        }
    },

    methods: {
        ...mapMutations(["setUser"]),

        async loadProfileDetails() {
            if (!this.user || !this.user.user_id) return;
            this.loading = true;

            // 1. Fetch fresh user info from backend
            try {
                const userRes = await axios.get("/users/id/" + this.user.user_id);
                if (userRes && userRes.data && userRes.data.user_id) {
                    this.profile = userRes.data;
                    // Keep Vuex / storage in sync with all fresh fields
                    this.setUser({ ...this.user, ...userRes.data });
                } else if (this.user.user_email) {
                    const emailRes = await axios.get("/users/" + encodeURIComponent(this.user.user_email));
                    if (emailRes && emailRes.data && emailRes.data.user_id) {
                        this.profile = emailRes.data;
                        this.setUser({ ...this.user, ...emailRes.data });
                    }
                }
            } catch (err) {
                console.log("Error loading profile details:", err);
                this.profile = { ...this.user };
            }

            // 2. Fetch user order history count
            try {
                const billRes = await axios.get("/billstatus/user/" + this.user.user_id);
                if (billRes && Array.isArray(billRes.data)) {
                    this.orderCount = billRes.data.length;
                }
            } catch (err) {
                console.log("Error loading order count:", err);
            } finally {
                this.loading = false;
            }
        },

        onLogout() {
            this.setUser("");
            this.$router.push("/login");
        }
    }
};
</script>

<style scoped>
.profile-container {
    padding: 2rem 9% 4rem 9%;
    min-height: 80vh;
}

/* Hero User Card */
.user-hero-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 1rem;
    padding: 2.5rem 3rem;
    display: flex;
    align-items: center;
    gap: 2.5rem;
    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.04);
    margin-bottom: 3rem;
    flex-wrap: wrap;
}

.avatar-box {
    flex-shrink: 0;
}

.avatar-circle {
    width: 8rem;
    height: 8rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #f38609 0%, #e67e22 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
    box-shadow: 0 0.4rem 1.2rem rgba(243, 134, 9, 0.35);
}

.user-hero-info {
    flex: 1;
    min-width: 24rem;
}

.user-title-row {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    flex-wrap: wrap;
    margin-bottom: 0.6rem;
}

.user-title-row h2 {
    font-size: 2.4rem;
    color: #130f40;
    font-weight: 600;
    margin: 0;
}

.badge-status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #e8f8f0;
    color: #27ae60;
    font-size: 1.3rem;
    font-weight: 600;
    padding: 0.4rem 1rem;
    border-radius: 2rem;
    border: 1px solid #b7ebd0;
}

.user-id-text {
    font-size: 1.4rem;
    color: #777;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.user-hero-stats {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.stat-pill {
    background: #f7f7f7;
    border: 1px solid #eaeaea;
    border-radius: 0.8rem;
    padding: 1rem 1.6rem;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    min-width: 12rem;
}

.stat-pill i {
    font-size: 2.2rem;
    color: #f38609;
}

.stat-meta {
    display: flex;
    flex-direction: column;
}

.stat-val {
    font-size: 1.8rem;
    font-weight: 700;
    color: #130f40;
    line-height: 1.2;
}

.stat-lbl {
    font-size: 1.2rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Section Header */
.section-title {
    margin-bottom: 1.8rem;
}

.section-title h4 {
    font-size: 2rem;
    color: #130f40;
    font-weight: 600;
    margin: 0 0 0.4rem 0;
}

.section-title .subtitle {
    font-size: 1.4rem;
    color: #888;
}

/* Details Grid */
.details-section {
    margin-bottom: 3.5rem;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(32rem, 1fr));
    gap: 1.8rem;
}

.info-card {
    background: #f7f7f7;
    border: 1px solid #eee;
    border-radius: 0.8rem;
    padding: 1.8rem 2rem;
    display: flex;
    align-items: center;
    gap: 1.8rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

.info-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.6rem 1.4rem rgba(0, 0, 0, 0.05);
    background: #fff;
}

.info-card .icon-wrap {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    background: #fff;
    border: 1px solid #e2e8f0;
    color: #27ae60;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    flex-shrink: 0;
    box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.03);
}

.info-card:hover .icon-wrap {
    background: #27ae60;
    color: #fff;
}

.info-body {
    flex: 1;
    overflow: hidden;
}

.info-body label {
    display: block;
    font-size: 1.3rem;
    color: #888;
    margin-bottom: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
}

.info-value {
    font-size: 1.7rem;
    color: #130f40;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.info-value.lowercase {
    text-transform: lowercase;
}

.info-value.capitalize {
    text-transform: capitalize;
}

.info-value.highlight {
    color: #27ae60;
}

/* Quick Actions Section */
.actions-section {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 1rem;
    padding: 2.5rem;
}

.action-buttons-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    align-items: center;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 2rem;
    font-size: 1.5rem;
    font-weight: 500;
    text-decoration: none !important;
}

.action-btn.btn-accent {
    background: #f38609;
}

.action-btn.btn-accent:hover {
    background: #e67e22;
}

.action-btn.btn-outline {
    background: transparent;
    color: #130f40;
    border: 1px solid #ccc;
}

.action-btn.btn-outline:hover {
    background: #130f40;
    color: #fff;
    border-color: #130f40;
}

.action-btn.btn-danger {
    background: transparent;
    color: #e74c3c;
    border: 1px solid #e74c3c;
}

.action-btn.btn-danger:hover {
    background: #e74c3c;
    color: #fff;
}

/* Not Logged In View */
.not-logged-card {
    background: #f7f7f7;
    border: 1px solid #eee;
    border-radius: 1rem;
    padding: 5rem 3rem;
    text-align: center;
    max-width: 60rem;
    margin: 4rem auto;
}

.lock-icon-wrap {
    width: 9rem;
    height: 9rem;
    border-radius: 50%;
    background: #fff;
    color: #f38609;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    margin-bottom: 2rem;
    box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.06);
}

.not-logged-card h3 {
    font-size: 2.4rem;
    color: #130f40;
    margin-bottom: 1rem;
    font-weight: 600;
}

.not-logged-card p {
    font-size: 1.6rem;
    color: #666;
    margin-bottom: 2.5rem;
    line-height: 1.6;
}

.auth-btn-row {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.btn-secondary-outline {
    background: transparent;
    color: #27ae60;
    border: 1px solid #27ae60;
}

.btn-secondary-outline:hover {
    background: #27ae60;
    color: #fff;
}

@media (max-width: 768px) {
    .profile-container {
        padding: 2rem 5% 4rem 5%;
    }

    .user-hero-card {
        padding: 2rem;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .user-hero-stats {
        width: 100%;
    }

    .stat-pill {
        flex: 1;
    }

    .action-buttons-wrap {
        flex-direction: column;
        align-items: stretch;
    }

    .action-btn {
        justify-content: center;
    }
}
</style>
