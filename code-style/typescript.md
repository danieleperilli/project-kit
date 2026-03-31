## TypeScript Rules

### Stack & Style

- TypeScript only.
- Node.js 22 or higher.
  - Backend (preferred): CommonJS
  - Frontend (preferred): ESM / React 19
- Indentation: 4 spaces.
- Strings: always use double quotes (`"`).

### Documentation

- JSDoc is **mandatory** for every function and method.
- Always use `@param` for **all parameters**.
- **Never use `@returns`**, even when the function returns a value.

### Types

- Prefer `interface` over `type`, **except** for:
  - union types
  - tuple types
- Interface names must start with `I`
  Examples: `IConfig`, `IUser`, `IRequestContext`
- The only exception is the interface for React component props, which should use the `Props` suffix instead of the `I` prefix.

### Async & Variables

- Always use `async/await` for asynchronous code.
- Avoid nested callbacks.
- Use `const` for non-reassigned variables.
- Use `let` only when reassignment is required.
- Use template literals for non-trivial string concatenation.

### Functions/Methods

- Never use multiple lines to define a function or method contract.

Allowed:

```ts
function test(a: string, b: number, c: boolean) {
    // ...
}
```

Not allowed:

```ts
function test(
    a: string,
    b: number,
    c: boolean
) {
    // ...
}
```

### Imports

- Never split imports across multiple lines.

Allowed:

```ts
import { A, B, C } from "module";
```

Not allowed:

```ts
import {
    A,
    B,
    C
} from "module";
```

### Ternary Operator

- Prefer this code style for ternary operators:

Allowed:

```ts
const status = isActive ? "active" : "inactive";
const status =
  isActive ? "active" :
  "inactive";
```

Not allowed:

```ts
const status = isActive
    ? "active"
    : "inactive";
```
