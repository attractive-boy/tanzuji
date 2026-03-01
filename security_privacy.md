# Security & Privacy Checklist

1. Data minimization: store only required user identifiers and ledger metadata.
2. Encryption: ensure DB connections use TLS (Azure MySQL supports SSL). Do not log secrets.
3. Auth: add user auth before exposing `/ledger` and `/badges` in production.
4. Privacy policy: prepare clear user-facing policy for data retention and deletion.
5. Input validation: validate ledger payloads server-side.
6. Rate limiting & abuse protection: add basic rate limits and bot protection before public launch.

Follow OWASP and local regulations for international deployments.
