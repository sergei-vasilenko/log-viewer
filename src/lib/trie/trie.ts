type TokenId = string | number;

type StartIndex = number;
type EndIndex = number;
type IndexRange = [StartIndex, EndIndex];
type MatchValue = IndexRange[];

// type CharScope = {
//   [char: string]: CharScope | TokenId[];
// } & {
//   _sourceIds?: TokenId[];
// };

interface ITrie {
  index(tokenId: TokenId, token: string): void;
  search(string: string): void;
  matchings: { [id: TokenId]: MatchValue };
}

class Trie {
  private _state;

  constructor() {
    this._state = {};
  }

  index(tokenId: string, token: string) {
    let currentScope = this._state;

    for (const char of token.toLowerCase()) {
      if (!currentScope[char]) {
        if (!this._state[char]) {
          currentScope[char] = { _sourceIds: new Set([tokenId]) };
          this._state[char] = currentScope[char];
        } else {
          this._state[char]._sourceIds.add(tokenId);
          currentScope[char] = this._state[char];
        }
      } else {
        currentScope[char]._sourceIds.add(tokenId);
      }
      currentScope = currentScope[char];
    }
  }
}
