<template>
  <div class="display-row">
    {{ markMessage }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { computed } from "vue";

export default defineComponent({
  name: "SearchIndex",
  props: {
    message: String,
    markers: Array,
    inFocus: Number,
  },
  setup(props) {
    const message = props.message || "";
    const markMessage = computed(() => {
      let str = "";
      let cursor = 0;

      for (const [
        position,
        [startIndex, endIndex],
      ] of props?.markers?.entries() || []) {
        str += message.slice(cursor, startIndex);
        str += `<span class="marked${
          position === props.inFocus ? " focused" : ""
        }">${message.slice(startIndex, endIndex)}</span>`;
        cursor = endIndex;
      }
      str += message.slice(cursor);

      return str;
    });

    return { markMessage };
  },
});
</script>
