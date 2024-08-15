<template>
  <div class="viewer">
    <div class="controls">
      <SearchStrings
        :strings="messagesForIndex"
        :availableStringIds="logIds"
        @matchings="setMarkers"
        @changeFocus="setFocus"
      />
      <Filter title="Уровни" :list="levelList" @change="setFilters" />
    </div>
    <Display :logs="logs" :markers="markers" :focus="focus" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SearchStrings from "@/components/SearchStrings.vue";
import Filter from "@/components/Filter.vue";
import Display from "@/components/Display.vue";
import { LogLevel } from "@/lib/api/enums";
import useLogs from "@/composables/useLogs";
import type { SearchResult } from "@/lib/trie/trie.types";
import type { MatchingFocus, FilterOption } from "@/types";

export default defineComponent({
  name: "LogViewer",
  components: {
    SearchStrings,
    Filter,
    Display,
  },
  setup() {
    const { logs, logIds, messagesForIndex, setFilters } = useLogs();

    const markers = ref<SearchResult>({});
    const focus = ref<MatchingFocus>({});

    const setMarkers = (data: SearchResult): void => {
      markers.value = data;
    };

    const setFocus = (position: MatchingFocus): void => {
      focus.value = position;
    };

    const levelList = Object.values(LogLevel).reduce(
      (acc: FilterOption[], level) => {
        acc.push({
          id: level,
          label: level,
          value: level,
        });
        return acc;
      },
      []
    );

    return {
      levelList,
      logs,
      logIds,
      messagesForIndex,
      markers,
      focus,
      setFilters,
      setMarkers,
      setFocus,
    };
  },
});
</script>

<style lang="scss">
.viewer {
  margin-top: 120px;
  height: calc(100vh - 120px);
  overflow: hidden;
}

.controls {
  display: flex;
  gap: 100px;
  padding: 10px;
}
</style>
