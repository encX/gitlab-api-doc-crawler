export interface Parser<T> {
  isValid(): boolean;
  parse(): T;
}
