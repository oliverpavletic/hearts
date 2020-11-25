const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nums = '0123456789';

export class GameCodeGenerator {

  private letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private nums = '0123456789';

  private numCharacters: number;
  private numDigits: number;
  private generatedCodes: Set<string>;

  constructor(initialNumCharacters: number, initialNumDigits: number) {
    this.numCharacters = initialNumCharacters;
    this.numDigits = initialNumDigits;
    this.generatedCodes = new Set();
  }

  public nextGameCode(): string {
    const result = new Array(this.numCharacters + this.numDigits);
  
    for (let i = 0; i < this.numCharacters; i += 1) {
      result[i] = this.letters.charAt(Math.floor(Math.random() * this.letters.length));
    }
  
    for (let i = this.numCharacters; i < this.numCharacters + this.numDigits; i += 1) {
      result[i] = this.nums.charAt(Math.floor(Math.random() * this.nums.length));
    }

    let resultStr = result.join('');

    if (this.generatedCodes.has(resultStr)) {
      this.numCharacters += 1;
      this.numDigits += 1;
      return this.nextGameCode();
    }

    this.generatedCodes.add(resultStr);
  
    return resultStr;
  };
}
