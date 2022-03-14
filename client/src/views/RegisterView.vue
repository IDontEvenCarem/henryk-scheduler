<script setup lang="ts">
import { ref } from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/stores/User'

const store = useUserStore()
const router = useRouter()
const login = ref('')
const password = ref('')
const passwordRepeat = ref('')
const buttonDisabled = ref(false)


async function OnRegister()
{
  if (password.value != passwordRepeat.value) {
    alert("Passwords do not match!")
    return;
  }

	buttonDisabled.value = true
	try {
		if(await store.register(login.value, password.value)) {
      alert("Registration successful, please log in now")
      router.replace("/login");
    } else {
      alert("Could not register with the given credentials")
    }
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
      
      <p>Repeat Password</p>
      <input type="password" v-model="passwordRepeat">
      <br>

      <button v-on:click="OnRegister" v-bind:disabled="buttonDisabled">
        Register
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
    background: linear-gradient(0.65turn, #2762c2, #55b350);
    min-height:100vh;
  }
</style>