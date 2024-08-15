type CharIndexData = Set<number>;

type StartIndex = number;

type EndIndex = number;

export type Token = string;

export type TokenId = string | number;

export type MatchIndex = [StartIndex, EndIndex];

export type StateNodeData = {
  [tokenId: TokenId]: CharIndexData;
};

export type StateNode = {
  _data: StateNodeData;
} & {
  [key: string]: StateNode;
};

export type SearchResult = Record<TokenId, MatchIndex[]>;

export type State = {
  [key: string]: StateNode;
};

export type GroupItem = Record<string, any>;

export type GroupItemPattern = (item: GroupItem) => {
  id: string;
  value: string;
};

export interface ITrie {
  indexGroup: (tokens: GroupItem[], pattern: GroupItemPattern) => Promise<void>;
  index: (tokenId: TokenId, token: string) => void;
  search: (string: string) => SearchResult;
}
