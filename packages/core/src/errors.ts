export class XuanCoreError extends Error {
  constructor(
    message: string,
    readonly code: string
  ) {
    super(message);
    this.name = "XuanCoreError";
  }
}

export class UnsupportedInputError extends XuanCoreError {
  constructor(message: string) {
    super(message, "UNSUPPORTED_INPUT");
    this.name = "UnsupportedInputError";
  }
}
