<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from '@/components/HelloWorld.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/login">Log in</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView>
  </RouterView>
</template>

<style>
@import '@/assets/base.css';

a {
  margin: 1ch;
}

body {
  margin: 3ch 4ch;
}

</style>
