type CharIndexData = Set<number>;

type TokenId = string | number;

type StartIndex = number;

type EndIndex = number;

type MatchIndex = [StartIndex, EndIndex];

type StateNodeData = {
  [tokenId: TokenId]: CharIndexData;
};

type StateNode = {
  _data: StateNodeData;
} & {
  [key: string]: StateNode;
};

type State = {
  [key: string]: StateNode;
};

class Trie {
  private _state: State;

  constructor() {
    this._state = {};
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
    tokens: { id: string | number; value: string }[]
  ): Promise<void> {
    const asyncTasks = tokens.map((item) => {
      return new Promise((resolve) => {
        this.index(item.id, item.value);
        resolve(null);
      });
    });

    await Promise.all(asyncTasks);
  }

  index(tokenId: TokenId, token: string) {
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

  search(string: string) {
    if (!string) return {};

    const lowercaseString = string.toLowerCase();
    const stringLength = string.length;

    let startData;
    let scope: State | StateNode = this._state;

    for (let charIdx = 0; charIdx < lowercaseString.length; charIdx++) {
      const char = lowercaseString[charIdx];

      if (!scope) return {};

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
