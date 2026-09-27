// Interface stubs — see plan/DECISIONS.md D-010. Implementations replace the throw bodies.
export class NotImplementedError extends Error {
  constructor(what: string) { super(`not implemented: ${what}`); this.name = 'NotImplementedError'; }
}
export class ValidationError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'ValidationError'; }
}
