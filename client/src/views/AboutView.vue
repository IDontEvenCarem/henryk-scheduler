<script lang="ts" setup>
import StandardPageWrapper from "../components/StandardPageWrapper.vue";
import {useModalStack} from '@/stores/ModalStack'
import OkModalVue from "@/components/Modals/OkModal.vue";

const modalStack = useModalStack()

function testOpenModal() {
	modalStack.pushModal(OkModalVue, {title: "Test"}, () => {
	})
	setTimeout(() => {
		modalStack.pushModal(OkModalVue, {title: "Test"}, () => {
			
		})
	}, 2000)
}

</script>

<template>
	<StandardPageWrapper>
		<h1>This is an about page</h1>
		<br>
		<button @click="testOpenModal">Click here to open a test modal</button>
	</StandardPageWrapper>
</template>