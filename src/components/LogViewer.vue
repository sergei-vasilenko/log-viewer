<template>
  <div class="viewer">
    <pre v-for="log of logList" :key="log.Timestamp">{{ log.Message }}</pre>
    <SearchIndex @matchings="getMatchings" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ref } from "vue";
import useApiService from "@/composables/useApiService";
import { LogItem } from "@/lib/api/types";
import { Action } from "@/lib/api/enums";
import SearchIndex from "@/components/Search.vue";

export default defineComponent({
  name: "LogViewer",
  components: {
    SearchIndex,
  },
  setup() {
    const logList = ref<LogItem[]>([]);
    const { receiveLogs } = useApiService();

    const getMatchings = (data) => {};

    receiveLogs(({ Action: actionType, Items }) => {
      if (actionType === Action.Initial) {
        logList.value = Items;
      } else if (actionType === Action.Add) {
        logList.value = [...logList.value, ...Items];
      }
    });

    return { logList, getMatchings };
  },
});
</script>
