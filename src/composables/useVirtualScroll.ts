import { onMounted, onUnmounted, ref, watch, computed, Ref } from "vue";
import { MatchingFocus } from "@/types";

const FIRST_RENDER_LIST_LENGTH = 50;

export default function useVirtualScroll(
  root: Ref<Element | null>,
  layout: Ref<Element | null>,
  list: Ref<any[]>,
  focus: Ref<MatchingFocus>
) {
  const observer = ref<MutationObserver | null>();
  const indexEdges = ref<{ start: number; end: number }>({
    start: 0,
    end: FIRST_RENDER_LIST_LENGTH,
  });
  const rootRect = ref<{
    top: number;
    bottom: number;
    height: number;
  }>({
    top: 0,
    bottom: 0,
    height: 0,
  });
  const rowHeight = ref<number>(0);
  const maxVisibleRows = ref<number>(0);
  const listTranslateY = ref<number>(0);

  const layoutHeight = computed(() => {
    return list.value.length * rowHeight.value;
  });

  const visibleList = computed(() => {
    return list.value.slice(indexEdges.value.start, indexEdges.value.end + 1);
  });

  const focusedRow = computed(() => {
    return Object.keys(focus.value)[0];
  });

  watch(focusedRow, (id) => {
    const numId = Number(id);
    const activeIndex = list.value.findIndex((row) => row.index === numId);
    if (activeIndex >= 0) {
      const offset = activeIndex * rowHeight.value;
      root.value?.scrollTo(0, offset);
    }
  });

  watch(
    root,
    (container) => {
      if (container) {
        const { top, bottom, height } = container.getBoundingClientRect();
        rootRect.value = { top, bottom, height };

        const observerHandler = (mutationsList: MutationRecord[]) => {
          for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
              const elem = container.querySelector("[data-index]");
              if (elem) {
                rowHeight.value = elem.getBoundingClientRect().height;
                break;
              }
            }
          }
        };
        observer.value = new MutationObserver(observerHandler);
        observer.value.observe(container, { childList: true });
      }
    },
    { immediate: true }
  );

  const unwatch = watch(rowHeight, (height) => {
    observer.value?.disconnect();
    maxVisibleRows.value = Math.ceil(rootRect.value.height / height);
    unwatch();
  });

  const calcListOffset = () => {
    const layoutTop = layout.value?.getBoundingClientRect().top || 0;
    const offset = Math.max(0, rootRect.value.top - layoutTop);
    indexEdges.value.start = Math.floor(offset / rowHeight.value);
    indexEdges.value.end = Math.floor(
      indexEdges.value.start + maxVisibleRows.value
    );
    listTranslateY.value = offset;
  };

  onMounted(() => {
    root.value?.addEventListener("scroll", calcListOffset);
  });

  onUnmounted(() => {
    root.value?.removeEventListener("scroll", calcListOffset);
  });

  return {
    visibleList,
    layoutHeight,
    listTranslateY,
  };
}
