import { TokenId } from "@/lib/trie/trie.types";
import { LogItem } from "@/lib/api/types";

export type MatchingFocus = Record<TokenId, number>;

export type FilterOption = {
  id: string | number;
  label: string;
  value: string;
};

export type IndexedString = { index: number; value: string };

export type LogsChank = {
  forView: LogItem[];
  forIndex: IndexedString[];
};
