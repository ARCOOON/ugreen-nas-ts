# Contributing to UGREEN NAS TypeScript SDK

Thank you for your interest in contributing to the UGREEN NAS TypeScript SDK (`@ugreen-nas/sdk`)!

## Development Guidelines

1. **Object-Oriented Design**:
   - Entities must be first-class domain classes extending `NasResource<T>`.
   - Behavior methods (e.g. `user.edit()`, `disk.getSmartInfo()`) belong on the domain instances.
   - Collections and factories belong on the Managers (`client.users`, `client.network`, etc.).
2. **Zero External Runtime Dependencies**:
   - The SDK relies strictly on standard built-in APIs (`crypto`, `fetch`, `http`, `https`, `url`).
3. **Type-Stripping & Native ESM Compatibility**:
   - Use explicit `.ts` file extensions in relative imports (`import { User } from "./users.ts"`).
   - Declare class fields explicitly instead of using constructor parameter properties (`constructor(private x: Y)`).
   - Use `as const` objects with exported types instead of runtime TypeScript `enum` blocks so code runs natively under Node `--experimental-strip-types`.

## Running Checks & Tests

```bash
npm install
npm test
```

## Security

Please read [SECURITY.md](SECURITY.md) before submitting code dealing with authentication tokens or cryptographic handshakes.
