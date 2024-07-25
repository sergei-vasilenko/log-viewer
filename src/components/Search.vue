<template>
  <div class="search">
    <input type="text" v-modal="text" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ref, reactive, watch, defineEmits } from "vue";
import { Trie } from "@/lib/trie";

export default defineComponent({
  name: "SearchIndex",
  props: {
    logs: Array,
  },
  setup(props) {
    const text = ref("");
    const indexedLogs = reactive(new Trie());
    const emit = defineEmits(["matchings"]);
    for (const [id, log] of props.logs.entries()) {
      indexedLogs.index(id, log.Message);
    }

    watch(text, (value) => {
      indexedLogs.search(value);
      emit("matchings", indexedLogs.matchings);
    });

    return { text };
  },
});
</script>