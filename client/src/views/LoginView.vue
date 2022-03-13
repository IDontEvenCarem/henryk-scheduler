<script setup lang="ts">
import { ref } from 'vue'
import {useUserStore} from '@/stores/User'

const store = useUserStore()
const login = ref('')
const password = ref('')
const buttonDisabled = ref(false)

async function OnLogin()
{
	buttonDisabled.value = true
	try {
		await store.login(login.value, password.value)
		alert("Login successful")
	} catch (err) {
		alert(err)
	}
	buttonDisabled.value = false
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

      <button v-on:click="OnLogin" v-bind:disabled="buttonDisabled">
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