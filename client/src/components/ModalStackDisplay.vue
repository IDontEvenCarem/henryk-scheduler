<script setup lang="ts">
import {useModalStack} from '@/stores/ModalStack'

const modalStack = useModalStack()

function pop(...args : any[]) {
    modalStack.pop(args);
}

</script>

<template>
    <!-- <div class="modal-stack-root" :gofront="modalStack.modals.length > 0"> -->
    <div class="modal-stack-root" :gofront="modalStack.modals.length > 0">
        <Transition name="fade">
            <div class="background" v-if="modalStack.modals.length > 0" @click="modalStack.cancel()"></div>
        </Transition>
        <TransitionGroup name="scalebounce">
            <div v-for="modal in modalStack.modals" class="modal-wrapper" :key="modal.idx" @click.self="modalStack.cancel()">
                <component :is="Object.assign({}, modal.component)" v-bind="modal.props" @closeModal="pop" @close="pop"></component>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.modal-stack-root {
    display: grid;
    position: fixed;
    z-index: 100;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    grid-template-columns: auto;
    grid-template-rows: auto;
    grid-template-areas: "only";
}
.modal-stack-root[gofront=true] {
    z-index: 100;
}
.modal-stack-root:empty {
    z-index: -1;
}
.background {
    background-color: black;
    filter: opacity(0.5);
    grid-area: only;
}
.interaction-plane {
    grid-area: only;
}
.modal-wrapper {
    grid-area: only;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: 1fr auto 1fr;
}
.modal-wrapper > * {
    grid-area: 2/2/3/3;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease-in-out;
  opacity: 1;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scalebounce-enter-active,
.scalebounce-leave-active {
    transition: all 300ms ease;
    transform: scale(1);
}

.scalebounce-enter-from,
.scalebounce-leave-to {
    transform: scale(0);
}

.scalebounce-enter-to,
.scalebounce-leave-from {
    transform: scale(1);
}

</style>