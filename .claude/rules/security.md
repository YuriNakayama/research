# Security Guidelines

## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on all endpoints
- [ ] Error messages don't leak sensitive data

## Confidential File Protection

NEVER read or modify the following files:

- `.env`, `.env.*`
- `/config/secrets.*`
- `**/*.pem`, `**/*.key`
- Files containing API keys, certificates, or credentials

## Secret Management

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

**Security Principles:**

- Manage sensitive information using environment variables
- Prohibit output of confidential information to logs and console
- Prohibit hardcoding of sensitive data

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Use **security-reviewer** agent
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues

## Cloud Infrastructure Security

### IAM & Access Control

- No root account usage in production
- MFA enabled for all privileged accounts
- Service accounts use roles, not long-lived credentials
- IAM policies follow least privilege
- Regular access reviews conducted

### Network Security

- Database not publicly accessible
- SSH/RDP ports restricted to VPN/bastion only
- Security groups follow least privilege
- VPC flow logs enabled

### Logging & Monitoring

- CloudWatch/logging enabled for all services
- Failed authentication attempts logged
- Admin actions audited
- Log retention configured (90+ days for compliance)
- Alerts configured for suspicious activity

### CI/CD Pipeline Security

- OIDC used instead of long-lived credentials
- Secrets scanning in pipeline
- Dependency vulnerability scanning
- Branch protection rules enforced
- Code review required before merge

### Pre-Deployment Cloud Security Checklist

- [ ] IAM: Root account not used, MFA enabled, least privilege policies
- [ ] Secrets: All secrets in cloud secrets manager with rotation
- [ ] Network: Security groups restricted, no public databases
- [ ] Logging: CloudWatch/logging enabled with retention
- [ ] Encryption: Data encrypted at rest and in transit
- [ ] Backups: Automated backups with tested recovery
