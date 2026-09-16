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
                <div class="fas fa-shopping-cart cart">
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
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.05);
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

.header .icons div {
    height: 4.5rem;
    width: 4.5rem;
    line-height: 4.5rem;
    font-size: 2rem;
    background: #f7f7f7;
    color: #130f40;
    border-radius: .5rem;
    margin-left: .3rem;
    cursor: pointer;
    text-align: center;
}

.header .icons div:hover {
    color: #fff;
    background: #27ae60 !important;
}

.header .icons a.router-link-exact-active .cart {
    background: #f38609;
    color: white;
}

.header .icons .cart-btn-link {
    display: inline-block;
    position: relative;
    text-decoration: none;
    vertical-align: middle;
}

.header .icons .cart {
    position: relative;
}

.header .icons .cart-badge {
    position: absolute;
    top: -0.6rem;
    right: -0.6rem;
    background: #e74c3c;
    color: #ffffff;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1;
    min-width: 2.1rem;
    height: 2.1rem;
    padding: 0 0.4rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(231, 76, 60, 0.45);
    border: 2px solid #ffffff;
    pointer-events: none;
    font-family: 'Poppins', sans-serif;
    letter-spacing: -0.3px;
    z-index: 10;
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
    margin-left: -50px;
    list-style-type: none;
}

.header .icons .account .drop-down-select a {
    text-decoration: none;
    color: #130f40;
    font-size: 15px;
    font-weight: 500;
    float: left;
    width: 95px;
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