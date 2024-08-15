<template>
  <div class="search">
    <input
      class="search__input"
      type="text"
      placeholder="Искать"
      v-model="text"
    />
    <div class="search__indicator">{{ navIndicator }}</div>
    <div class="search__actions">
      <button title="назад" @click="prevFocusTarget" class="search__button">
        <ArrowUpIcon />
      </button>
      <button title="далее" @click="nextFocusTarget" class="search__button">
        <ArrowDownIcon />
      </button>
      <button title="сбросить" @click="reset" class="search__button">
        <ClearIcon />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import useSearch from "@/composables/useSearch";
import { TokenId } from "@/lib/trie/trie.types";
import { IndexedString } from "@/types";
import ArrowUpIcon from "@/assets/svg/ArrowUpIcon.vue";
import ArrowDownIcon from "@/assets/svg/ArrowDownIcon.vue";
import ClearIcon from "@/assets/svg/CloseIcon.vue";

export default defineComponent({
  name: "SearchStrings",
  components: {
    ArrowUpIcon,
    ArrowDownIcon,
    ClearIcon,
  },
  props: {
    strings: {
      type: Array as PropType<IndexedString[]>,
      default: () => [],
    },
    availableStringIds: {
      type: Set as PropType<Set<number>>,
      required: true,
    },
    topStringId: {
      type: [String, Number] as PropType<TokenId>,
    },
  },
  emits: ["matchings", "changeFocus"],
  setup(props, { emit }) {
    const { text, navIndicator, prevFocusTarget, nextFocusTarget, reset } =
      useSearch(props, emit);
    return { text, navIndicator, prevFocusTarget, nextFocusTarget, reset };
  },
});
</script>

<style lang="scss" scope>
.search {
  display: flex;
  gap: 12px;
  border: 1px solid #767676;
  border-radius: 6px;
}

.search__input {
  font-size: 18px;
  padding: 2px 6px;
  border: none;
  outline: none;
  border-radius: 6px;
}

.search__indicator {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-family: "Courier New", Courier, monospace;
  width: 80px;
  cursor: default;
}

.search__actions {
  display: flex;
}

.search__button {
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 24px;
  height: 24px;
  & svg {
    width: 12px;
    height: 12px;
  }
}
</style>
