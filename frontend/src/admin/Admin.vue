<template>
    <div class="admin-login-page">
        <div class="admin-card">
            <div class="brand-header">
                <img src="../assets/images/taco-logo.png" alt="P&C's Kitchen Logo" class="brand-logo" />
                <h2 class="brand-title">P&C's Kitchen</h2>
                <span class="brand-tag">Admin Portal</span>
                <p class="brand-desc">Enter your administrative password to access operations and forecasting.</p>
            </div>

            <form id="adminForm" @submit="handleSubmit" novalidate autocomplete="off">
                <div v-if="errors.length" class="error-box">
                    <ul>
                        <li v-for="error in errors" :key="error">
                            <i class="fas fa-circle-exclamation"></i> {{ error }}
                        </li>
                    </ul>
                </div>

                <div class="form-group">
                    <label for="uPass" class="field-label">Security Key</label>
                    <div class="input-container">
                        <i class="fas fa-lock field-icon"></i>
                        <input
                            type="password"
                            id="uPass"
                            name="uPass"
                            class="form-control"
                            placeholder="Enter admin password..."
                            v-model="adminObj.pass"
                            autofocus
                        />
                    </div>
                </div>

                <button type="submit" class="btn submit-btn">
                    <span>Access Dashboard</span>
                    <i class="fas fa-arrow-right"></i>
                </button>

                <div class="return-home">
                    <router-link to="/">
                        <i class="fas fa-arrow-left"></i> Return to Restaurant Website
                    </router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
    name: "Admin",

    data() {
        return {
            adminObj: { pass: "" },
            key: "25082002",
            errors: [],
        };
    },

    methods: {
        ...mapMutations(["setAdmin"]),

        handleSubmit(e) {
            e.preventDefault();
            this.errors = [];

            if (!this.adminObj.pass) {
                this.errors.push("Password is required");
                return;
            }

            if (this.key === this.adminObj.pass) {
                this.setAdmin("admin");
                this.$router.push("/admin/dashboard");
            } else {
                this.errors.push("Admin password is wrong!");
            }
        },
    },
};
</script>

<style scoped>
.admin-login-page {
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    padding: 3rem 9%;
}

.admin-card {
    max-width: 46rem;
    width: 100%;
    background: #fff;
    box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.08);
    border: 0.1rem solid #e1e7ec;
    padding: 3.5rem 3rem;
    border-radius: 1rem;
    animation: fadeUp 0.4s linear;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(2rem);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.brand-header {
    text-align: center;
    margin-bottom: 2.5rem;
}

.brand-logo {
    width: 6rem;
    height: auto;
    margin-bottom: 1rem;
}

.brand-title {
    font-size: 2.8rem;
    font-weight: 700;
    color: #130f40;
    margin: 0 0 0.4rem 0;
}

.brand-tag {
    font-family: "Satisfy", cursive;
    font-size: 2.6rem;
    color: #27ae60;
    display: block;
    margin-bottom: 0.8rem;
}

.brand-desc {
    font-size: 1.5rem;
    color: #666;
    margin: 0;
    line-height: 1.5;
}

.field-label {
    font-size: 1.5rem;
    font-weight: 600;
    color: #130f40;
    margin-bottom: 0.8rem;
    display: block;
}

.input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.field-icon {
    position: absolute;
    left: 1.5rem;
    font-size: 1.8rem;
    color: #888;
    pointer-events: none;
}

.form-control {
    width: 100%;
    border-radius: 0.5rem;
    background: #f7f7f7;
    border: 1px solid #ddd;
    padding: 1.5rem 1.5rem 1.5rem 4.5rem;
    font-size: 1.6rem;
    color: #130f40;
    text-transform: none;
    transition: 0.2s linear;
}

.form-control:focus {
    background: #fff;
    border-color: #27ae60;
    box-shadow: 0 0 0 0.3rem rgba(39, 174, 96, 0.15);
}

.submit-btn {
    margin-top: 2rem;
    margin-bottom: 1.5rem;
    width: 100%;
    padding: 1.3rem;
    font-size: 1.8rem;
    font-weight: 600;
    background: #27ae60;
    color: #fff;
    border-radius: 0.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    transition: 0.2s linear;
}

.submit-btn:hover {
    background-color: #f38609;
    color: #fff;
}

.return-home {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
}

.return-home a {
    font-size: 1.5rem;
    color: #666;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    transition: 0.2s linear;
}

.return-home a:hover {
    color: #27ae60;
    text-decoration: underline !important;
}

.error-box {
    background-color: #fff9fa;
    border: 1px solid rgba(255, 66, 79, 0.3);
    border-radius: 0.5rem;
    font-size: 1.4rem;
    margin-bottom: 2rem;
    padding: 1rem 1.5rem;
}

.error-box ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

.error-box ul li {
    color: #d63031;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.3rem 0;
}
</style>