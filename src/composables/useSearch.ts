import { computed, ref, watch, toRefs } from "vue";
import Trie from "@/lib/trie/trie.impl";
import { pickBy } from "@/assets/utils";
import { IndexedString, MatchingFocus } from "@/types";

export default function useSearch(
  props: {
    strings: IndexedString[];
    availableStringIds: Set<number>;
  },
  emit: (event: "matchings" | "changeFocus", ...args: any[]) => void
) {
  const trie = new Trie();
  const { strings, availableStringIds } = toRefs(props);

  const text = ref("");
  const activeMatchingIndex = ref<number | null>(null);

  const searchResult = computed(() => {
    const matchings = trie.search(text.value);
    return pickBy(matchings, (key: string) =>
      availableStringIds.value.has(Number(key))
    );
  });
  watch(searchResult, (result) => emit("matchings", result));

  watch(strings, (data) =>
    trie.indexGroup(data, ({ index, value }) => ({ id: index, value }))
  );

  watch(text, (value) => {
    if (!value) {
      activeMatchingIndex.value = null;
    }
  });

  const focusTargets = computed(() => {
    return Object.entries(searchResult.value).reduce(
      (acc: MatchingFocus[], [tokenId, matchings]) => {
        for (const [index] of matchings.entries()) {
          acc.push({ [tokenId]: index });
        }
        return acc;
      },
      []
    );
  });

  watch(focusTargets, (targets) => {
    if (!targets.length) return;
    activeMatchingIndex.value = 0;
  });

  watch(activeMatchingIndex, (index) => {
    if (index === null) return;
    emit("changeFocus", focusTargets.value[index]);
  });

  const prevFocusTarget = () => {
    if (!focusTargets.value.length) return;
    if (activeMatchingIndex.value !== null && activeMatchingIndex.value !== 0) {
      activeMatchingIndex.value -= 1;
    } else {
      activeMatchingIndex.value = focusTargets.value.length - 1;
    }
  };

  const nextFocusTarget = () => {
    if (!focusTargets.value.length) return;
    if (
      activeMatchingIndex.value !== null &&
      activeMatchingIndex.value !== focusTargets.value.length - 1
    ) {
      activeMatchingIndex.value += 1;
    } else {
      activeMatchingIndex.value = 0;
    }
  };

  const reset = () => {
    text.value = "";
    activeMatchingIndex.value = null;
  };

  const navIndicator = computed(() => {
    const position =
      activeMatchingIndex.value !== null ? activeMatchingIndex.value + 1 : 0;
    return `${position}/${focusTargets.value.length}`;
  });

  return { text, navIndicator, prevFocusTarget, nextFocusTarget, reset };
}
