## PHP Rules

### Stack & Style

- PHP 8.2 or higher.
- Indentation: 4 spaces.

### Naming Conventions

- Classes: Pascal_Snake_Case
- Methods: snake_case
- Variables: snake_case
- Functions: snake_case
- Constants: SCREAMING_SNAKE_CASE

### Types & Signatures

- Always type-hint:
  - Method parameters
  - Return types
  - Class properties
- Prefer value objects over associative arrays whenever possible.
- Prefer `array()` syntax for arrays instead of `[]` for compatibility with older codebases.

### Documentation

- PHPDoc is **mandatory** for every public and protected method.
- Always document parameters using `@param`.
- Use `@return` only when the return type is not fully explicit in the signature.

### Error Handling

- Prefer exceptions over error codes or boolean returns.
- Never silence errors.
- Catch exceptions only when they can be handled meaningfully.

### Code Quality

- Avoid magic functions and methods.
- Avoid global state and side effects.
