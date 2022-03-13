<script lang="ts" setup>
import {RouterLink} from 'vue-router'
import {useUserStore} from '@/stores/User'
import { onMounted } from 'vue';

const user = useUserStore();
onMounted(() => {
    user.maybeInitialize();
})

</script>

<template>
    <div class="page-layout-wrapper">
        <nav>
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/about">About</RouterLink>
            <RouterLink to="/todos">Todos</RouterLink>
            <RouterLink to="/login">Log in</RouterLink>
            <div v-if="user.loggedIn">
                Logged in as {{user.username}}
            </div>
        </nav>

        <main>
            <slot></slot>
        </main>
    </div>
</template>

<style scoped>
    .page-layout-wrapper {
        /* for now just a dummy declaration, also makes it wide */
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: auto;
    }

    nav {
        display: flex;
        flex-direction: row;
    }
    nav > * {
        padding: 1ch;
    }

    main {
        padding: 1ch;
    }
</style>