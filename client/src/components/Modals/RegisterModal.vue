<script setup lang="ts">
import { ref } from 'vue'
import { QInput } from 'quasar';

const emit = defineEmits<{
    (e: 'closeModal'): void
}>();

const props = defineProps<{

}>()
const username=ref('')
const password=ref('')
const checkPassword=ref('')
</script>

<template>
    <div class="modal-card">

        <div class="container">
            <div class="title">CREATE ACCOUNT</div>

            <div class="user-details">
                <QInput v-model="username" type="text" label="Username" color="white" dark></QInput>
                <!-- Pola do wpisywania przez użytkownika -->
                <QInput v-model="password" type="password" label="Password" color="white" dark></QInput>
                <QInput v-model="checkPassword" type="password" label="Repeat password" color="white" dark></QInput>
            </div>

            <!-- Guziczek do zarejestrowania się
            <div class="button">
                 <input type="submit" value="Zarejestruj się">
            </div> -->

            <button @click="" class="button" style="vertical-align:middle"><span>Register </span></button>

        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap');
.modal-card {
    min-width: 500px;
    color: black;
    border-radius: 5px;
    padding: 1ch;
    font-family: 'Montserrat', sans-serif;
}

.container{ /* Pole rejestracji */
        grid-area: a;
        align-self: center;
        justify-self: center;
        color: rgb(163, 163, 163);
        box-shadow: 0px 0px 5px black;


        width: 100%;
        background-color: #24252A;
        padding: 30px 30px;
        border-radius: 7px; /* Zaokrąglone rogi */
        line-height: 30px;
    }
    .container .title{
        word-spacing: 2px;
        line-height: 40px;
        font-size: 25px;
        font-weight: 800;
        position: relative;
        text-align: center;
        margin-bottom: 6px;
    }
    .container .title::before{
        content: '';
        position: absolute;
        left: 0;
        bottom: 0px;
        height: 3px;
        width: 80%;
        left: 10%;
        background: linear-gradient(135deg, #71b7e6, #6cc4a4);
    }
    .container form .user-details{
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between; /* Odległości między kolumnami */
        justify-content: center;
        align-items: center;
    }
    form .user-details .input-box{
        text-align: center;
        margin: 13px;
        width: calc(100% / 2 - 20px);
    }
    .user-details .input-box input{
        text-align: center;
        height: 30px;
        width: 100%;
        background-color: #27272b;
        border: none;
        border-bottom: 2px solid white;
        color: wheat;
    }

    .button{
        display: block; /* Aby wycentrować guziczek */
        margin: 0 auto;
        margin-top: 16px;
        border-radius: 5px;
        /* background-color: rgb(255, 54, 245); */
        background: linear-gradient(135deg, #71b7e6, #6cc4a4);
        border: none;
        color: rgb(31, 31, 31);
        /* color: #FFFFFF; */
        font-size: 20px;
        padding: 7px 20px;
        width: 55%;
        transition: all 0.5s;
        cursor: pointer;
    }

    .button span{
        cursor: pointer;
        display: inline-block;
        position: relative;
        transition: 0.5s;
    }

    .button span:after{
        content: '\00bb';
        position: absolute;
        opacity: 0;
        top: 0;
        right: -20px;
        transition: 0.5s;
    }

    .button:hover span{
        padding-right: 25px;
    }

    .button:hover span::after{
        opacity: 1;
        right: 0;
    }
</style>