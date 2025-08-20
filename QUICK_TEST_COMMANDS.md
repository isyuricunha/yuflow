# 🚀 Quick Test Execution Commands

## Frontend Tests (React/TypeScript)

```bash
# Install dependencies (run once)
pnpm install

# Run all frontend tests
pnpm test

# Run tests in watch mode (for development)
pnpm test --watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test Button.test.tsx
```

## Backend Tests (Rust)

```bash
# Navigate to Rust directory
cd src-tauri

# Run all Rust tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_create_and_get_task

# Run tests with coverage (install cargo-tarpaulin first)
cargo install cargo-tarpaulin
cargo tarpaulin --out Html
```

## Privacy Compliance Tests

```bash
# Run privacy tests specifically
pnpm test privacy-compliance.test.ts

# Run with detailed output
pnpm test privacy-compliance.test.ts --reporter=verbose
```

## All Tests at Once

```bash
# Frontend tests
pnpm test

# Backend tests (in separate terminal)
cd src-tauri && cargo test
```

## Expected Results

**Frontend Tests:**
- Button component: 8 tests
- Input component: 7 tests  
- TaskItem component: 8 tests
- Privacy compliance: 10 tests

**Backend Tests:**
- Database CRUD: 12 tests
- Validation: 4 tests
- Search/Filter: 3 tests
- Settings: 2 tests

## Troubleshooting

**If tests fail:**
1. Ensure dependencies are installed: `pnpm install`
2. For Rust tests: `cargo clean && cargo build`
3. Check that SQLite is available on your system
