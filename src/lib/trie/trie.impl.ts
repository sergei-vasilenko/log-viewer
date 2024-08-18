import {
  ITrie,
  State,
  StateNode,
  StateNodeData,
  SearchResult,
  GroupItem,
  GroupItemPattern,
  TokenId,
  MatchIndex,
} from "./trie.types";
import { chankArray } from "@/assets/utils";

class Trie implements ITrie {
  private _state: State;
  private _indexedTokens: Set<string | number>;

  constructor() {
    this._state = {};
    this._indexedTokens = new Set();
  }

  _generateResult(
    startData: StateNodeData,
    endData: StateNodeData,
    tokenLength: number
  ) {
    return Object.keys(endData).reduce(
      (acc: Record<TokenId, MatchIndex[]>, tokenId: TokenId) => {
        const startIndices = startData[tokenId];
        const endIndices = endData[tokenId];

        endIndices.forEach((charEndIdx) => {
          const endIdx = charEndIdx + 1;
          const expectedStartIdx = endIdx - tokenLength;
          const position: MatchIndex | null = startIndices.has(expectedStartIdx)
            ? [expectedStartIdx, endIdx]
            : null;
          if (position) {
            if (!acc[tokenId]) acc[tokenId] = [];
            acc[tokenId].push(position);
          }
        });

        return acc;
      },
      {}
    );
  }

  _addDataToNode(node: StateNode, tokenId: TokenId, index: number) {
    if (!node._data[tokenId]) {
      node._data[tokenId] = new Set([]);
    }
    node._data[tokenId].add(index);
  }

  async indexGroup(
    tokens: GroupItem[],
    pattern: GroupItemPattern = ({ id, value }) => ({ id, value })
  ): Promise<void> {
    const asyncTasks = tokens.map((item) => ({
      then: (onFulfilled: () => void) => {
        const token = pattern(item);
        this.index(token.id, token.value);
        onFulfilled();
      },
    }));

    await Promise.all(asyncTasks);
  }

  index(tokenId: TokenId, token: string): void {
    if (this._indexedTokens.has(tokenId)) return;

    this._indexedTokens.add(tokenId);
    const lowercaseToken = token.toLowerCase();
    const writableScopes: StateNode[] = [];

    for (let charIdx = 0; charIdx < lowercaseToken.length; charIdx++) {
      const char = lowercaseToken[charIdx];

      if (!this._state[char]) {
        this._state[char] = {
          _data: { [tokenId]: new Set([charIdx]) },
        } as StateNode;
      } else {
        this._addDataToNode(this._state[char], tokenId, charIdx);
      }
      const newScope = this._state[char];

      for (let scopeIdx = 0; scopeIdx < writableScopes.length; scopeIdx++) {
        const scope = writableScopes[scopeIdx];

        if (!scope[char]) {
          scope[char] = {
            _data: { [tokenId]: new Set([charIdx]) },
          } as StateNode;
        } else {
          this._addDataToNode(scope[char], tokenId, charIdx);
        }
        writableScopes[scopeIdx] = scope[char];
      }
      writableScopes.push(newScope);
    }
  }

  search(string: string): SearchResult {
    if (!string) return {};

    const lowercaseString = string.toLowerCase();
    const stringLength = string.length;

    let startData;
    let scope: State | StateNode = this._state;

    for (let charIdx = 0; charIdx < lowercaseString.length; charIdx++) {
      const char = lowercaseString[charIdx];

      if (!scope || !scope[char]) return {};

      if (charIdx === 0) {
        startData = scope[char]._data;
      }

      scope = scope[char];
    }

    const endData = scope._data as StateNodeData;

    if (!startData || !endData) return {};

    return this._generateResult(startData, endData, stringLength);
  }
}

export default Trie;
