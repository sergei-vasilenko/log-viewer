<template>
  <div ref="displayRef" class="display">
    <template v-if="logs.length">
      <div ref="layoutRef" :style="`height: ${layoutHeight}px`">
        <div :style="`transform: translateY(${listTranslateY}px)`">
          <DisplayRow
            v-for="log of visibleList"
            :key="log.index"
            :index="log.index"
            :data="log.data"
            :markers="markers[log.index]"
            :focus="focus[log.index]"
          />
        </div>
      </div>
    </template>
    <div v-else class="empty-state">Ничего нет</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, PropType } from "vue";
import DisplayRow from "@/components/DisplayRow.vue";
import { LogItem } from "@/lib/api/types";
import { SearchResult } from "@/lib/trie/trie.types";
import useVirtualScroll from "@/composables/useVirtualScroll";

export default defineComponent({
  name: "DisplayComponent",
  components: { DisplayRow },
  props: {
    logs: { type: Array as PropType<LogItem[]>, default: () => [] },
    markers: { type: Object as PropType<SearchResult>, default: () => ({}) },
    focus: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const displayRef = ref<Element | null>(null);
    const layoutRef = ref<Element | null>(null);
    const { logs, focus } = toRefs(props);

    const { visibleList, layoutHeight, listTranslateY } = useVirtualScroll(
      displayRef,
      layoutRef,
      logs,
      focus
    );

    return { displayRef, layoutRef, layoutHeight, listTranslateY, visibleList };
  },
});
</script>

<style scope lang="scss">
.display {
  height: 90%;
  overflow: auto;
  padding: 10px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 600;
  height: 100%;
}
</style>
