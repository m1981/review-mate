
1. **For Team Members (Key Generation)**
```bash
# Each team member generates their own key pair
age-keygen -o ~/.age/key.txt

# Extract public key for sharing
age-keygen -y ~/.age/key.txt > my_public_key.txt
# or
cat ~/.age/key.txt | grep "public key:"
```

2. **Centralized Key Management**

Option A: Using a secure password manager (Recommended):
```plaintext
1. Create a secure shared vault in 1Password/LastPass/BitWarden
2. Store all team members' public keys
3. Store production private keys (if applicable)
4. Use strict access controls
```

Option B: Using Git (for public keys only):
```bash
# Create a dedicated repository or directory
mkdir -p team-keys/public-keys

# Structure
team-keys/
├── README.md
└── public-keys/
    ├── alice.txt
    ├── bob.txt
    └── carol.txt
```

3. **Update SOPS Configuration**
```yaml
# .sops.yaml
creation_rules:
  - path_regex: secrets/.*\.yaml$
    age:
      # Development Team
      - age1rl24j... # Alice (Dev)
      - age1pr93m... # Bob (Dev)
      - age1xy72k... # Carol (DevOps)
      
      # CI/CD
      - age1ci82j... # GitHub Actions
      
      # Production
      - age1prod2... # Production Key
```

4. **Environment-Specific Keys**
```yaml
# .sops.yaml
creation_rules:
  - path_regex: secrets/prod/.*\.yaml$
    age:
      - age1prod2... # Production only
      - age1devop... # DevOps team only

  - path_regex: secrets/dev/.*\.yaml$
    age:
      - age1rl24j... # All developers
      - age1pr93m...
      - age1xy72k...
```

5. **Onboarding Documentation** (save as `KEYS.md`):
```markdown
# Key Management

## New Team Members
1. Generate your key pair:
   ```bash
   age-keygen -o ~/.age/key.txt
   ```
2. Extract your public key:
   ```bash
   age-keygen -y ~/.age/key.txt
   ```
3. Share your public key with DevOps team via [Secure Password Manager]
4. Wait for confirmation that you've been added to .sops.yaml

## Local Setup
1. Store your private key:
   ```bash
   export SOPS_AGE_KEY_FILE=~/.age/key.txt
   ```
2. Test access:
   ```bash
   sops -d secrets/dev/test.yaml
   ```
```

6. **Security Best Practices**
```plaintext
- Never share private keys
- Rotate keys periodically
- Use different keys for different environments
- Maintain an access audit log
- Remove keys when team members leave
- Use least-privilege access model
```

7. **Emergency Access Protocol** (save as `EMERGENCY.md`):
```markdown
## Emergency Access Protocol

1. Production Keys Location:
   - Primary: Secured in [Password Manager]
   - Backup: With [Security Team Lead]

2. Emergency Contacts:
   - Primary: [DevOps Lead]
   - Secondary: [Security Lead]

3. Recovery Procedure:
   1. Contact emergency key holders
   2. Verify identity through established channels
   3. Follow key rotation procedure
```

