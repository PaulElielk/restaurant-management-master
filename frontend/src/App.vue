<template>
    <div id="app">
        <!-- Admin Routes Layout (Admin Login & Dashboard) -->
        <div v-if="isAdminRoute">
            <router-view></router-view>
        </div>

        <!-- Customer Website Layout (always shows NavBar, Chatbot, Footer) -->
        <div v-else>
            <NavBar />

            <div class="auth-wrapper">
                <div class="auth-inner">
                    <router-view></router-view>
                </div>
            </div>
            <Chatbot />
            <FooterComponent />
        </div>
    </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
import FooterComponent from './components/FooterComponent.vue';
import Chatbot from './components/Chatbot.vue';
import { mapActions } from 'vuex';
import { mapState } from 'vuex';
export default {
    name: 'App',
    components: {
        NavBar,
        FooterComponent,
        Chatbot
    },

    mounted() {
        this.getFoodsData()
    },

    computed: {
        ...mapState(["admin"]),

        isAdminRoute() {
            return Boolean(this.$route && this.$route.path && this.$route.path.startsWith('/admin'));
        }
    },

    methods: {
        ...mapActions(["getFoodsData"])
    }
}
</script>

<style>
@import "./assets/css/global_style.css";
</style>

