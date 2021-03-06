<script setup lang="ts">
import { GoldenLayout, LayoutManager } from 'golden-layout'
import type { ComponentItem } from 'golden-layout'
import { inject, markRaw, onMounted, provide, ref, watch, type Ref } from 'vue';
import type { Component } from 'vue';
import TodosWidgetVue from './components/TodosWidget.vue';
import CalendarVue from './components/Calendar.vue';
import ModalStackDisplay from './components/ModalStackDisplay.vue';
import { AddComponentAfterFocusedKey, CloseFocusedWindowKey, RecOpenQueueKey} from '@/injections'
import { QBtn, QToolbar, QToolbarTitle, QLayout, QHeader, QPage, QPageContainer, QFooter, QMenu, QItem,QItemSection, QIcon } from 'quasar';
import NoteListWindowVue from './components/Windows/NoteListWindow.vue';
import CalendarWindowVue from './components/Windows/CalendarWindow.vue';
import { useModalStack } from './stores/ModalStack';
import LoginModalVue from './components/Modals/LoginModal.vue';
import RegisterModalVue from './components/Modals/RegisterModal.vue';
import ExportModalVue from './components/Modals/ExportModal.vue';
import { identity } from 'lodash';
import ImportModalVue from './components/Modals/ImportModal.vue';
import TodoViewWindowVue from './components/Windows/TodoViewWindow.vue';

// import HelloWorldVue from './components/HelloWorld.vue';
// import TheWelcomeVue from './components/TheWelcome.vue';

const dark = inject("dark", false);

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

const recQueue : Ref<[string, object][]> = ref([])

provide(AddComponentAfterFocusedKey, addComponentAfterSelected)
provide(CloseFocusedWindowKey, closeFocusedComponent)
provide(RecOpenQueueKey, recQueue)

watch(recQueue, (v) => {
  v.forEach(([thing, params]) => {
    const component = (()=>{
      if (thing === 'TodoViewWindow') {
        return TodoViewWindowVue
      }
    })()

    if (component !== undefined) {
      addComponentAfterSelected(component, params)
    }
  })
  if (v.length > 0) {
    recQueue.value = []
  }
})

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

function closeFocusedComponent () {
  glhr.value?.focusedComponentItem?.close();
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

  glhost.addEventListener('resize', () => {
    console.log("resize triggered")
  })

  glhost.addEventListener('itemDropped', ev => {
    ev.element.style.setProperty('--gl-width', ev.element.style.width)
    ev.element.style.setProperty('--gl-height', ev.element.style.height)
  })
})

onMounted(() => {
    addComponent(TodosWidgetVue)
    addComponent(NoteListWindowVue)
    // addComponent(CalendarVue)
    addComponent(CalendarWindowVue)
    // addComponent(DebugVue)
})

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
    document.querySelectorAll(".lm_items").forEach(elem => {
      const helem = (elem as HTMLElement)
      helem.style.setProperty('--gl-width', helem.style.width)
      helem.style.setProperty('--gl-height', helem.style.height)
    })
  }
}

window.addEventListener("resize", ev => {
  console.log('resize window')
  computeResize()
})

function openLoginModal()
{
  modalStack.push(LoginModalVue as any, {}, true, (canceled, result) => {})
}

function openRegisterModal()
{
  modalStack.push(RegisterModalVue as any, {}, true, (canceled, result) => {})
}

function openExportModal () {
  modalStack.push(ExportModalVue as any, [], true, () => {})
}

function openImportModal () {
  modalStack.push(ImportModalVue as any, [], true, identity)
}

</script>

<template>
  <ModalStackDisplay></ModalStackDisplay>
  <QLayout view="hHh lpr fFf" @resize="computeResize">
    <QHeader class="header" ref="head">
      <QToolbar>
        <QToolbarTitle>Henryk</QToolbarTitle>
        <QBtn flat @click="addComponent(NoteListWindowVue)">Notes</QBtn>
        <QBtn flat @click="addComponent(TodosWidgetVue)">Todos</QBtn>
        <QBtn flat @click="addComponent(CalendarWindowVue)">Calendar</QBtn>

        <QBtn flat >
          <QIcon name="settings"></QIcon>
          <QMenu :dark="dark" fit anchor="bottom left" self="top left">
            <QItem clickable>
              <QItemSection class="text-center" @click="openLoginModal">
                LOGIN
              </QItemSection>
            </QItem>
            <QItem clickable>
              <QItemSection class="text-center" @click="openRegisterModal">
                REGISTER
              </QItemSection>
            </QItem>
            <QItem clickable>
              <QItemSection class="text-center" @click="openExportModal">
                EXPORT
              </QItemSection>
            </QItem>
            <QItem clickable>
              <QItemSection class="text-center" @click="openImportModal">
                IMPORT
              </QItemSection>
            </QItem>
          </QMenu>
        </QBtn>

      </QToolbar>
    </QHeader>
    <QPageContainer>
      <QPage ref="page">
        <div v-if="elements.length === 0" class="background-alternative">
          <div>
            <h2 color="white">You have no windows open</h2>
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

@media (prefers-color-scheme: dark) {
  .header{
    background-color: #333;
  }
}

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
