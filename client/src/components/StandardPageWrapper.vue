<script lang="ts" setup>
import {RouterLink} from 'vue-router'
import {useUserStore} from '@/stores/User'
import { onMounted, ref} from 'vue';
import { QBar, QBtn } from 'quasar'

const user = useUserStore();
onMounted(() => {
    user.maybeInitialize();
})

function OnLogout() {
    user.logOut()
}

</script>

<template>
    <div class="page-layout-wrapper">
        <QBar class="bg-primary">
            <div><RouterLink to="/" class="gt-md">Home</RouterLink></div>
            <div><RouterLink to="/about">About</RouterLink></div>
            <div><RouterLink to="/todos">Todos</RouterLink></div>
            <div><RouterLink to="/calendar">Calendar</RouterLink></div>
            <div><RouterLink to="/notes/list">Notes</RouterLink></div>
            <div v-if="user.loggedIn">
                Logged in as {{user.username}}
                <a @click="OnLogout" href="#">Log out</a>
            </div>
            <template v-else>
                <div><RouterLink to="/login">Log in</RouterLink></div>
                <div><RouterLink to="/register">Register</RouterLink></div>
            </template>
        </QBar>

        <main>
            <slot></slot>
        </main>
    </div>
</template>

<style scoped>
    main {
        padding: 1ch;
    }
</style>