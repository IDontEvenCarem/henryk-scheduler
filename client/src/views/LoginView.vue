<script setup>
import { ref } from 'vue'

const login = ref('')
const password = ref('')

function OnLogin()
  {
    alert(login.value + ' ' + password.value)
  }
</script>

<template>
  <div class="wrapper">
    <button v-on:click="$router.go(-1)">
      Return
    </button>
    
    <div class="center"> 
      <p>Login</p>
      <input v-model="login">
      <p>Password</p>

      <input type="password" v-model="password">
      <br>

      <button v-on:click="OnLogin">
        Log in
      </button>
    </div>
  </div>
</template>

<style scoped>
  .center{
    display:grid;
    grid-template-columns:33% 33% 33%;
  }
  .center > * {
    grid-column:2/3;
  }
  .wrapper{
    /*background-color:lightgray;*/
    /*background: linear-gradient(0.15turn, #e66465, #9198e5);*/ /*We can use it*/
    background: linear-gradient(0.15turn, #2762c2, #55b350);
    min-height:100vh;
  }
</style>