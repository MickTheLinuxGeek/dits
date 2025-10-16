# Security Audit Configuration

## Overview

This document explains the security audit configuration for DITS and the rationale behind certain decisions.

## Audit Configuration

The project uses `audit-ci` to check for known vulnerabilities in dependencies. The configuration is defined in `.audit-ci.json`:

- **Severity threshold**: Moderate and above
- **Skip dev dependencies**: Yes (production audits only)
- **Reason**: Dev dependencies are not shipped to production and pose minimal security risk

## Current Known Issues

### Validator.js URL Validation Bypass (GHSA-9965-vmph-33xx)

**Status**: Accepted Risk (Development Only)

**Advisory**: CVE-2025-56200  
**Severity**: Moderate (CVSS 6.1)  
**Affected Package**: `validator@<=13.15.15`  
**Dependency Chain**: `swagger-jsdoc` → `swagger-parser` → `@apidevtools/swagger-parser` → `z-schema` → `validator`

**Vulnerability**: A URL validation bypass exists in validator.js where the `isURL()` function uses `://` as a delimiter to parse protocols, while browsers use `:` as the delimiter. This parsing difference can lead to XSS and Open Redirect attacks.

**Mitigation**:
1. **swagger-jsdoc moved to devDependencies**: The affected package is only used for API documentation generation during development
2. **Conditional usage in production**: Swagger docs are only enabled when `NODE_ENV=development` or `enableApiDocs` config flag is set (see `src/app.ts`)
3. **No user input validation**: The validator package is used internally by swagger-parser to validate OpenAPI specifications, not for validating user input
4. **Production impact**: Zero - dev dependencies are not installed in production builds (`npm ci --production`)

**Resolution Path**:
- Monitor https://github.com/advisories/GHSA-9965-vmph-33xx for patches
- When a patched version of `validator` is released, upgrade dependencies
- Consider alternatives like `@fastify/swagger` if the issue persists long-term

## Testing Security Audits

### Local Testing
```bash
# Check all dependencies (including dev)
npm audit

# Check production dependencies only
npx audit-ci --config .audit-ci.json

# Check production dependencies (CI simulation)
npm ci --production
npm audit --production
```

### CI/CD
The GitHub Actions workflow runs security audits on every push and PR:
- Checks production dependencies only
- Fails on moderate severity or higher (in production deps)
- Allows dev dependency vulnerabilities if they don't affect production

## Best Practices

1. **Regular Updates**: Run `npm audit` regularly and keep dependencies updated
2. **Dependency Review**: Review new dependencies before adding them to package.json
3. **Principle of Least Privilege**: Keep dev-only packages in devDependencies
4. **Monitor Advisories**: Subscribe to security advisories for critical dependencies
5. **Production Builds**: Use `npm ci --production` for production deployments

## Related Files

- `.audit-ci.json` - Audit-CI configuration
- `.github/workflows/ci.yml` - CI pipeline with security checks
- `package.json` - Dependency declarations with proper dev/prod separation

## Last Updated

2025-10-16 - Initial documentation with validator vulnerability analysis
