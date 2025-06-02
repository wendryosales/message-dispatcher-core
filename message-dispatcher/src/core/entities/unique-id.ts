import { randomUUID } from "node:crypto";

export class UniqueEntityID {
  private readonly _value: string;

  constructor(value?: string) {
    this._value = value || this.generate();
  }

  public toString() {
    return this._value;
  }

  private generate() {
    return randomUUID();
  }

  public equals(id: UniqueEntityID) {
    return id.toString() === this._value;
  }
}
