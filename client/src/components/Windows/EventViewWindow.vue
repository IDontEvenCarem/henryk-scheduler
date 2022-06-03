<script setup lang="ts">

import { GetWithLinks, type AnyEvent, type AnyThing, type ReplacedID } from '@/database';
import type { ID } from '@/dbintegration';
import { onMounted, ref, type Ref } from 'vue';
import LinksView from '../LinksView.vue';

const props = defineProps<{
    setTitle: (title: string) => void,
    id: ID
}>()

const event : Ref<AnyEvent | undefined> = ref(undefined)
const linked : Ref<ReplacedID<AnyThing>[]> = ref([]) 

onMounted(() => {
    props.setTitle("Event")
    GetWithLinks(props.id).then(_event => {
        props.setTitle((_event.value as AnyEvent).name)
        event.value = _event.value as AnyEvent;
        linked.value = _event.linked
    })
})

</script>

<template>
    <div v-if="event === undefined">
        <h5 style="text-align: center;">Loading...</h5>
    </div>
    <div v-else>
        <pre>{{JSON.stringify(event, undefined, 2)}}</pre>
        <LinksView :links="linked"></LinksView>
    </div>
</template>