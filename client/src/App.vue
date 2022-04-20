<script setup lang="ts">
import { GoldenLayout } from 'golden-layout'
import { markRaw, onMounted, ref, type Ref } from 'vue';
import type { Component } from 'vue';
import TodosWidgetVue from './components/TodosWidget.vue';
import NoteListVue from './components/NoteList.vue'
// import HelloWorldVue from './components/HelloWorld.vue';
// import TheWelcomeVue from './components/TheWelcome.vue';

const host = ref<HTMLElement | undefined>(undefined)
const ready = ref<boolean>(false)
const value = ref(0)
const tphidx = ref(0n)
const glhr = ref<any>(undefined)
const elements : Ref<[any, bigint, object][]> = ref([])
const fnInsertIntoGL = ref<undefined | ((state: object & {idx: bigint}) => void)>(undefined)

function addComponent (component: Component, extras: object = {}) {
  if (fnInsertIntoGL.value !== undefined) {
    const selfidx = tphidx.value
    tphidx.value = tphidx.value + 1n
    fnInsertIntoGL.value({...extras, idx: selfidx})
    requestAnimationFrame(() => {
      elements.value = [...(elements.value), [markRaw(component), selfidx, extras]]
    })
    return selfidx
  }
}

function removeComponent (idx: bigint) {
  console.log('removing with idx ', idx)
  elements.value = elements.value.filter(v => v[1] !== idx)
}

onMounted(() => {
  const glhost = new GoldenLayout(host.value)
  
  glhost.registerComponentFactoryFunction('tphost', (container, state) => {
    if (typeof state === 'object' && state !== null && 'idx' in state) {
      let selfidx = state.idx
      if (selfidx !== undefined && selfidx !== null) {
        const tpnode = document.createElement('div')
        tpnode.id = `tphost-${selfidx.toString()}`
        tpnode.classList.add('tphost')
        container.element.appendChild(tpnode)
      }
    }
  })

  window.addEventListener('resize', ev => {
    glhost.updateRootSize()
  })

  glhost.addEventListener('itemDestroyed', ev => {
    if('isComponent' in ev.target && (ev.target as any).isComponent) {
      // @ts-ignore
      const didx = BigInt(((ev.target as any).element as HTMLElement).querySelector('.tphost')?.id.substr('tphost-'.length))
      removeComponent(didx)
    }
  })

  glhost.loadLayout({
    root: {
      type: 'row',
      content: []
    }
  })

  fnInsertIntoGL.value = state => {
    glhost.addComponent('tphost', state)
  }

  ready.value = true
  glhr.value = glhost
})

onMounted(() => {
//   addComponent(HelloWorldVue, {msg: 'hello!'})
//   addComponent(TheWelcomeVue, {})
    addComponent(TodosWidgetVue)
    addComponent(TodosWidgetVue)
    addComponent(NoteListVue)
})

</script>

<template>
  <div v-if="elements.length === 0" class="background-alternative">
    <div>
      <h2 color="white">This should be hidden</h2>
      <button>Open a tab</button>
    </div>
  </div>
  <div class="whole-page">
    <div class="header">
  
    </div>
    <div class="host" ref="host"></div>
  </div>
  <div id="tp-source-store" v-if="ready">
    <Teleport v-for="pair in elements" :key="pair[1].toString()" :to="`#tphost-${pair[1]}`">
      <Component :is="pair[0]" v-bind="pair[2]"></Component>
    </Teleport>
  </div>
</template>

<style>
.whole-page {
  position: fixed;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
}
.background-alternative {
  z-index: 2;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 1fr auto 1fr;
}
.background-alternative > * {
  grid-area: 2/2/3/3;
}
.header {
  background-color: blue;
  height: 100px;
}
.host {
  width: 100%;
  height: 100%;
}
.tphost {
  height: 100%;
}
</style>
