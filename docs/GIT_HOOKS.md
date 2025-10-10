# Git Hooks Guide

This project uses Git hooks to ensure code quality **before** commits and pushes reach GitHub.

## What Happens Automatically

### When You Commit (`git commit`)

The **pre-commit hook** runs on your staged files:

1. ✨ **ESLint** - Auto-fixes code issues
2. 💅 **Prettier** - Auto-formats code
3. 🔍 **TypeScript** - Type checks your code

If any check fails, the commit is **aborted** and you'll see error messages.

### When You Push (`git push`)

The **pre-push hook** runs on your entire codebase:

1. 📝 **Type Check** - `npm run type-check`
2. 🔍 **Lint** - `npm run lint`
3. ✨ **Format Check** - `npm run format:check`
4. 🔨 **Build** - `npm run build`

These are the **same checks** that GitHub CI runs. If they pass locally, they'll pass in CI!

## Quick Commands

```bash
# Run all CI checks manually (same as pre-push)
npm run ci:check

# Individual checks
npm run type-check      # Check TypeScript types
npm run lint            # Check code quality
npm run lint:fix        # Fix linting issues
npm run format          # Format all code
npm run format:check    # Check if code is formatted
npm run build           # Build TypeScript
npm run test            # Run tests
```

## Common Scenarios

### ❌ Commit Failed

```bash
# See what's wrong
npm run type-check
npm run lint

# Auto-fix what you can
npm run lint:fix
npm run format

# Try committing again
git commit -m "your message"
```

### ❌ Push Failed

```bash
# Run the full check suite
npm run ci:check

# Fix any errors shown, then try again
git push
```

### ⚡ Skip Hooks (Emergency Only!)

```bash
# Skip pre-commit (not recommended)
git commit --no-verify -m "message"

# Skip pre-push (not recommended)
git push --no-verify
```

**⚠️ Warning**: Skipping hooks means your code will likely fail CI on GitHub!

## Why Git Hooks?

### Before (Without Hooks)
1. Write code
2. Commit
3. Push to GitHub
4. Wait for CI (5+ minutes)
5. ❌ CI fails with TypeScript/lint errors
6. Fix errors locally
7. Push again
8. Wait for CI again...

### After (With Hooks)
1. Write code
2. Commit (hooks auto-fix and validate)
3. Push (hooks run full CI checks locally in ~30 seconds)
4. ✅ Everything works!
5. CI passes on GitHub

## Benefits

- 🚀 **Faster feedback** - Catch errors in seconds, not minutes
- 💰 **Save CI minutes** - Only push code that will pass
- 😌 **Less frustration** - No more failed CI builds for simple errors
- 🎯 **Consistent quality** - Everyone's code is checked the same way
- 📚 **Learn faster** - Immediate feedback on what's wrong

## Troubleshooting

### "Hooks not running"

Make sure hooks are installed:
```bash
npm install
# or
npm run prepare
```

### "Type check is slow"

Type checking the entire project can take a few seconds. This is normal and ensures no errors slip through.

### "I just want to commit quickly"

The pre-commit hook only checks **staged files** and auto-fixes most issues. It should be very fast!

If you're in a hurry:
1. Stage only the files you changed: `git add file1.ts file2.ts`
2. The hook only checks those files

## Configuration Files

- `.husky/pre-commit` - Runs on `git commit`
- `.husky/pre-push` - Runs on `git push`
- `package.json` - Contains `lint-staged` config
- `.eslintrc.*` - ESLint rules
- `.prettierrc.*` - Prettier formatting rules
- `tsconfig.json` - TypeScript compiler options

## Customization

### Change what pre-commit checks

Edit `package.json`:
```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "bash -c 'tsc --noEmit'"
  ]
}
```

### Change pre-push checks

Edit `.husky/pre-push` to add/remove steps.

### Disable a specific check

Comment out the check in the hook file or skip with `|| true`:
```bash
npm run type-check || true  # Won't fail if type-check fails
```

## Best Practices

1. **Commit often** - Small commits are easier to review and fix
2. **Run `npm run ci:check`** before starting a PR
3. **Fix errors immediately** - Don't let them pile up
4. **Don't skip hooks** - They exist to help you
5. **Update hooks** - When project standards change, update hooks too

## More Information

- See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed workflow
- See [GitHub Actions](.github/workflows/ci.yml) for CI configuration
- See [Husky docs](https://typicode.github.io/husky/) for hook customization
