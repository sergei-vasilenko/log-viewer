<template>
  <div
    :data-index="index"
    class="display-row"
    :class="{
      'display-row--gray': level === 'TRACE',
      'display-row--red': ['WARN', 'ERROR'].includes(level),
    }"
  >
    <div class="display-cell">{{ date }}</div>
    <div class="display-cell">{{ level }}</div>
    <div class="display-cell" v-html="message"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, reactive } from "vue";
import type { LogItemData } from "@/lib/api/types";
import type { MatchIndex } from "@/lib/trie/trie.types";

export default defineComponent({
  name: "DisplayRow",
  props: {
    index: { type: [Number, String], required: true },
    data: { type: Object as PropType<LogItemData>, default: () => ({}) },
    markers: { type: Array as PropType<MatchIndex[]>, default: () => [] },
    focus: { type: Number, default: -1 },
  },
  setup(props) {
    const log = reactive(props.data);
    const message = computed(() => {
      /* ToDo: для оптимизации computed:message по памяти реализовать следующий алгоритм
      - исходя из колличества подсвечиваемых частей текста посчитать длину необходимого массива
      - создать пустой массив нужной длины
      - собрать его из фрагментов текста
      - склеить строку
      */
      let str = "";
      let cursor = 0;

      for (const [index, [startIndex, endIndex]] of props.markers.entries()) {
        str += log.Message.slice(cursor, startIndex);
        str += `<span class="marked${
          index === props.focus ? " focused" : ""
        }">${log.Message.slice(startIndex, endIndex)}</span>`;
        cursor = endIndex;
      }
      str += log.Message.slice(cursor);

      return str;
    });

    const date = log.Timestamp;

    const level = log.Level;

    return { message, level, date };
  },
});
</script>

<style lang="scss">
.display-row {
  display: grid;
  grid-template-columns: repeat(3, auto);
  width: max-content;
  height: 1.5rem;
}

.display-row--gray {
  color: #757474;
}

.display-row--red {
  color: #fc5234;
}

.display-cell {
  padding: 0px 5px;
}

.marked {
  background-color: #f8e494;
}

.focused {
  background-color: #fc9937;
}
</style>
