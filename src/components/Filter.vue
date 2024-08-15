<template>
  <div class="filter">
    <div class="filter__title" @click="openStateToggle">{{ title }}</div>
    <div class="filter__list" v-show="isOpen">
      <label v-for="item of list" :key="item.index" class="filter__list-item">
        <input
          class="search__input"
          type="checkbox"
          :value="item.value"
          v-model="filters"
        />
        {{ item.label }}
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, ref, watch } from "vue";
import { FilterOption } from "@/types";

export default defineComponent({
  name: "FilterComponent",
  props: {
    title: {
      type: String,
      default: "Filter",
    },
    list: {
      type: Array as PropType<FilterOption[]>,
      default: () => [],
    },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const filters = ref<Set<number>>(new Set());
    const isOpen = ref<boolean>(false);
    const openStateToggle = () => {
      isOpen.value = !isOpen.value;
    };

    watch(filters, (value) => emit("change", value));

    return { filters, isOpen, openStateToggle };
  },
});
</script>

<style lang="scss">
.filter {
  display: flex;
  align-items: center;
  position: relative;
  height: 27px;
  width: 250px;
  cursor: pointer;
  border: 1px solid #767676;
  border-radius: 6px;
}

.filter__title {
  padding: 6px 8px;
  width: 100%;
}

.filter__list {
  position: absolute;
  top: 28px;
  width: 100%;
  background-color: #fafafa;
  box-shadow: 4px 4px 8px 0px #cad0d4;
  z-index: 9;
}

.filter__list-item {
  display: block;
  padding: 2px 6px;
}
</style>
