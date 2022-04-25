<script lang="ts" setup>
import StandardPageWrapper from "../components/StandardPageWrapper.vue";
import {useModalStack} from '@/stores/ModalStack'
import OkModalVue from "@/components/Modals/OkModal.vue";
import {QTime} from 'quasar'
import { ref } from "vue";

const modalStack = useModalStack()

const time = ref("")

</script>

<template>
	<StandardPageWrapper>
		<h1>This is an about page</h1>
		<br>
		<QTime v-model="time"></QTime>
	</StandardPageWrapper>
</template>