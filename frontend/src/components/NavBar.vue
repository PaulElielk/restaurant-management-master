<template>
    <div class="header">
        <router-link @click="scrollToTop()" to="/" class="logo"><img src="../assets/images/taco-logo.png" alt="" />P&C's Kitchen
        </router-link>

        <nav class="navbar">
            <router-link @click="scrollToTop()" to="/">home</router-link>
            <router-link @click="scrollToTop()" to="/about">about</router-link>
            <router-link @click="scrollToTop()" to="/promotions">promotions</router-link>
            <router-link @click="scrollToTop()" to="/menu">menu</router-link>
            <router-link @click="scrollToTop()" to="/table">table</router-link>
            
        </nav>

        <div class="icons">
            <div id="menu-btn" class="fas fa-bars menu-btn" @click="showNav"></div>
            <router-link @click="scrollToTop()" to="/cart" class="cart-btn-link" title="Shopping Cart">
                <div class="cart-box">
                    <i class="fas fa-shopping-cart"></i>
                    <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount > 99 ? '99+' : cartItemCount }}</span>
                </div>
            </router-link>

            <div v-if="!user" class="fas fa-user account" @click="showLog">
                <ul class="drop-down-select">
                    <li>
                        <router-link @click="scrollToTop()" to="/login">login</router-link>
                    </li>
                    <li>
                        <router-link @click="scrollToTop()" to="/register">register</router-link>
                    </li>
                </ul>

            </div>

            <div v-else class="fas fa-user account" style="background: #f38609;color: white;" @click="showLog">
                <ul class="drop-down-select">
                    <li>
                        <router-link @click="scrollToTop()" to="/profile">my profile</router-link>
                    </li>
                    <li>
                        <router-link @click="scrollToTop()" to="/myorder">my orders</router-link>
                    </li>
                    <li>
                        <router-link @click="handleLogout" to="/">logout</router-link>
                    </li>
                </ul>
            </div>

        </div>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
export default {
    name: 'NavBar',

    computed: {
        ...mapState(["user", "cartItemCount"])
    },

    watch: {
        user: {
            immediate: true,
            handler(newUser) {
                if (newUser && newUser.user_id) {
                    this.getCartItemCount();
                }
            }
        }
    },

    mounted() {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('cart-updated', this.handleCartUpdated);
        if (this.user && this.user.user_id) {
            this.getCartItemCount();
        }
    },
    unmounted() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('cart-updated', this.handleCartUpdated);
    },

    methods: {
        ...mapMutations(["setUser"]),
        ...mapActions(["getCartItemCount"]),

        handleCartUpdated() {
            if (this.user && this.user.user_id) {
                this.getCartItemCount();
            }
        },

        scrollToTop() {
            window.scrollTo(0, 0);
        },

        showNav: function () {
            let navbar = document.querySelector('.header .navbar');
            navbar.classList.toggle('active');
        },

        showLog: function () {
            let mq = window.matchMedia("(max-width: 768px)");
            if (mq.matches) {
                let log = document.querySelector('.drop-down-select');
                log.classList.toggle('active');
            }
        },

        handleScroll: function () {
            let navbar = document.querySelector('.header .navbar');
            navbar.classList.remove('active');
            let log = document.querySelector('.drop-down-select');
            log.classList.remove('active');
        },

        handleLogout: function () {
            this.setUser("");
        }
    }
}
</script>

<style scoped>
.header {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: #fff;
    /* Projector-safe: Darker shadow and thicker, more contrasted border */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    border-bottom: 2px solid #d1d1d1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 9%;
}

.header .logo {
    font-size: 2.5rem;
    font-weight: bolder;
    color: #130f40;
}

.header .logo img {
    padding-right: .5rem;
    color: #27ae60;
}

.header .navbar a {
    font-size: 1.7rem;
    margin: 0 1rem;
    color: #666;
}

.header .navbar a:hover {
    color: #27ae60;
}

.header .navbar a.router-link-exact-active {
    color: #f38609;
}

.header .icons {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.header .icons div {
    height: 4.5rem;
    width: 4.5rem;
    line-height: 4.5rem;
    font-size: 2rem;
    background: #f7f7f7;
    color: #130f40;
    border-radius: .5rem;
    cursor: pointer;
    text-align: center;
    margin: 0;
}

.header .icons div:hover {
    color: #fff;
    background: #27ae60 !important;
}

.header .icons .cart-btn-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    text-decoration: none;
    margin: 0;
    line-height: 1;
}

.header .icons .cart-box {
    height: 4.5rem;
    width: 4.5rem;
    background: #f7f7f7;
    color: #130f40;
    border-radius: .5rem;
    position: relative;
    overflow: visible;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
}

.header .icons .cart-box i {
    font-size: 2rem;
    color: #130f40;
    transition: color 0.2s;
    line-height: 1;
}

.header .icons div:hover i,
.header .icons .cart-box:hover i {
    color: #fff !important;
}

.header .icons a.router-link-exact-active .cart-box {
    background: #f38609;
    color: white;
}

.header .icons a.router-link-exact-active .cart-box i {
    color: white !important;
}

.header .icons .cart-badge {
    position: absolute;
    top: -0.6rem;
    right: -0.6rem;
    background: #e74c3c !important;
    color: #ffffff !important;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1 !important;
    min-width: 2.1rem;
    height: 2.1rem;
    padding: 0 0.45rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(231, 76, 60, 0.45);
    border: 2px solid #ffffff;
    pointer-events: none;
    font-family: 'Poppins', sans-serif !important;
    letter-spacing: -0.3px;
    z-index: 99;
    animation: cart-badge-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes cart-badge-pop {
    0% {
        transform: scale(0.3);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

#menu-btn {
    display: none;
}

.header .icons .account .drop-down-select {
    display: none;
    position: absolute;
    margin-left: -60px;
    list-style-type: none;
}

.header .icons .account .drop-down-select a {
    text-decoration: none;
    color: #130f40;
    font-size: 15px;
    font-weight: 500;
    float: left;
    width: 105px;
    border-radius: 5%;

}

.header .icons .account .drop-down-select.active {
    display: block !important;
}

.header .icons .account .drop-down-select.active a {
    background-color: #f7f7f7;
}

.header .icons .account .drop-down-select.active a:hover {
    background-color: #f38609;
    color: white;
}

/* .header .icons .account:hover .drop-down-select {
    display: block;
} */

.header .icons .account:hover .drop-down-select a {
    background-color: #f7f7f7;

}

.header .icons .account:hover .drop-down-select a:hover {
    background-color: #f38609;
    color: white;
}

@media (min-width: 769px) {
    .header .icons .account:hover .drop-down-select {
        display: block;
    }
}

@media (max-width: 768px) {
    .header .navbar {
        position: absolute;
        top: 99%;
        left: 0;
        right: 0;
        background: #fff;
        border-top: 0.1rem solid rgba(0, 0, 0, 0.2);
        border-bottom: 0.1rem solid rgba(0, 0, 0, 0.2);
        clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
    }

    .header .navbar.active {
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
    }

    .header .navbar a {
        font-size: 2rem;
        margin: 2rem;
        display: block;
    }

    #menu-btn {
        display: inline-block;
    }

}

@media (max-width: 576px) {
    .header .navbar a {
        font-size: 1.5rem;
        margin: 0;
    }
}
</style>