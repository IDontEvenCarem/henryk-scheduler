<script setup lang="ts">
import { GoldenLayout, LayoutManager } from 'golden-layout'
import type { ComponentItem } from 'golden-layout'
import { markRaw, onMounted, provide, ref, type Ref } from 'vue';
import type { Component } from 'vue';
import TodosWidgetVue from './components/TodosWidget.vue';
import NoteListVue from './components/NoteList.vue'
import CalendarVue from './components/Calendar.vue';
import ModalStackDisplay from './components/ModalStackDisplay.vue';
import {InsertAfterThisKey, AddComponentAfterFocusedKey} from '@/injections'
import { QBtn, QToolbar, QToolbarTitle, QLayout, QHeader, QPage, QPageContainer, QFooter } from 'quasar';
import { useModalStack } from './stores/ModalStack';
import LoginModalVue from './components/Modals/LoginModal.vue';
import RegisterModalVue from './components/Modals/RegisterModal.vue';
import { result } from 'lodash';
// import HelloWorldVue from './components/HelloWorld.vue';
// import TheWelcomeVue from './components/TheWelcome.vue';

const host = ref<HTMLElement | undefined>(undefined)
const page = ref<any>(undefined)
const head = ref<any>(undefined)
const ready = ref<boolean>(false)
const value = ref(0)
const tphidx = ref(BigInt(0))
const glhr = ref<GoldenLayout | undefined>(undefined)
const elements : Ref<[any, bigint, object, LayoutManager.Location | undefined][]> = ref([])
const fnInsertIntoGL = ref<undefined | ((state: object & {idx: bigint}) => LayoutManager.Location)>(undefined)
const fnInsertAfterFocused = ref<undefined | ((state: object & {idx: bigint}, focus?: boolean) => LayoutManager.Location | undefined)>(undefined)
const modalStack = useModalStack()

provide(AddComponentAfterFocusedKey, addComponentAfterSelected)

function addComponent (component: Component, extras: object = {}) {
  requestAnimationFrame(() => {    
    if (fnInsertIntoGL.value !== undefined) {
      const selfidx = tphidx.value
      tphidx.value = tphidx.value + BigInt(1)
      const loc = fnInsertIntoGL.value({...extras, idx: selfidx})
      requestAnimationFrame(() => {
        elements.value = [...(elements.value), [markRaw(component), selfidx, extras, loc]]
      })
      return selfidx
    }
  })
}

function addComponentAfterSelected (component: Component, props: object = {}) {
  console.log(component)
  requestAnimationFrame(() => {
    if (fnInsertAfterFocused.value !== undefined) {
      const selfidx = tphidx.value
      tphidx.value = tphidx.value + BigInt(1)
      const loc = fnInsertAfterFocused.value({...props, idx: selfidx})
      requestAnimationFrame(() => {
        elements.value = [...(elements.value), [markRaw(component), selfidx, props, loc]]
      })
      return selfidx
    }
  })
}

function removeComponent (idx: bigint) {
  console.log('removing with idx ', idx)
  elements.value = elements.value.filter(v => v[1] !== idx)
}

onMounted(() => {
  console.log("Hosting on")
  console.log(host.value)
  const glhost = new GoldenLayout(host.value)
  
  glhost.registerComponentFactoryFunction('tphost', (container, state) => {
    if (typeof state === 'object' && state !== null && 'idx' in state) {
      let selfidx = state.idx
      if (selfidx !== undefined && selfidx !== null) {
        const tpnode = document.createElement('div')
        tpnode.id = `tphost-${selfidx.toString()}`
        // by default, only clicking on the header focuses the element
        tpnode.addEventListener("click", ev => {
          container.focus()
        })
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
      const didx = BigInt(((ev.target as any).element as HTMLElement).querySelector('.tphost')?.id.substring('tphost-'.length) as string)
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
    return glhost.addComponent('tphost', state)
  }

  fnInsertAfterFocused.value = (state, focus = false) => {
    return glhost.addComponentAtLocation('tphost', state, undefined, [{typeId: 0, index: 1}, {typeId: 2}])
  }
  ready.value = true
  // @ts-ignore
  glhr.value = glhost
})

onMounted(() => {
    addComponent(TodosWidgetVue)
    addComponent(NoteListVue)
    addComponent(CalendarVue)
})

function loggg () {
  window.console.log(glhr.value?.focusedComponentItem?.element)
}

function setTitle (location: LayoutManager.Location | undefined) {
  return function (title: string) {
    if (location === undefined) return;
    const elem = location.parentItem.contentItems[location.index]
    if (elem.isComponent) {
      (elem as ComponentItem).setTitle(title)
    }
  }
}

function computeResize (size?: {width: number, height: number}) {
  if (host.value !== undefined && page.value !== undefined && head.value !== undefined) {
    const gsbr = host.value!.getBoundingClientRect()
    glhr.value?.setSize(gsbr.width, window.innerHeight - host.value!.getBoundingClientRect().top)
    glhr.value?.updateRootSize(true)
  }
}

window.addEventListener("resize", ev => {
  console.log('resize window')
  computeResize()
})

function openLoginModal()
{
  modalStack.push(LoginModalVue, {}, true, (canceled, result) => {})
}

function openRegisterModal()
{
  modalStack.push(RegisterModalVue, {}, true, (canceled, result) => {})
}
</script>

<template>
  <ModalStackDisplay></ModalStackDisplay>
  <QLayout view="hHh lpr fFf" @resize="computeResize">
    <QHeader ref="head">
      <QToolbar>
        <QToolbarTitle>Henryk</QToolbarTitle>
        <QBtn flat @click="addComponent(NoteListVue)">Notes</QBtn>
        <QBtn flat @click="addComponent(TodosWidgetVue)">Todos</QBtn>
        <QBtn flat @click="addComponent(CalendarVue)">Calendar</QBtn>
        <QBtn flat @click="openLoginModal">Login</QBtn>
        <QBtn flat @click="openRegisterModal">Register</QBtn>
      </QToolbar>
    </QHeader>
    <QPageContainer>
      <QPage ref="page">
        <div v-if="elements.length === 0" class="background-alternative">
          <div>
            <h2 color="white">This should be hidden</h2>
            <button>Open a tab</button>
          </div>
        </div>
        <div class="host" ref="host"></div>
      </QPage>
    </QPageContainer>
  </QLayout>
  
  <div id="tp-source-store" v-if="ready">
    <Teleport v-for="pair in elements" :key="pair[1].toString()" :to="`#tphost-${pair[1]}`">
      <Component :is="pair[0]" v-bind="pair[2]" :setTitle="setTitle(pair[3])"></Component>
    </Teleport>
  </div>
</template>

<style>
html,body {
    overflow: hidden;
}
.whole-page {
  /* width: 100vw; */
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
  grid-template-columns:  1fr auto 1fr;
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
  min-height: 100%;
  overflow: hidden;
}
.tphost {
  height: 100%;
}
.q-page {
  height: 100%;
}
</style>
