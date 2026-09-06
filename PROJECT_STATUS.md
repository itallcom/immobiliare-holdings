# Immobiliare Holdings — shared project status

Updated: 6 September 2026
Release: `2026-09-06-heraldic-v1`

## Organisation and source of truth

- Main retains project decisions. Design, Profile and Build remain dedicated chats.
- Check this file and the current source before requesting another handoff from the user.
- Checkout: `/workspace/sites/website-holdings`.
- Production destination: `https://immobiliare.holdings`, Hetzner `62.238.125.148`.
- Existing app directory: `/opt/holdings`; service: `holdings`; container: `holdings-control-room`.
- The source is not currently synced to an external Git remote. The release archive preserves this source.

## Latest design handoff found

- `immobiliare_site_design_v1.zip`, created 6 September 2026 at 01:37 UTC.
- Persistent source: `libfile_d06c8a891fec8191b915d9a00de979ac`, under Website Holdings.
- Contains a static visual prototype, README, stylesheet, robots.txt and the supplied heraldic crest.
- Direction: Company / Ownership / Stewardship / Continuity; serif typography; ivory, charcoal and deep green; no generic SaaS cards.
- The complete latest Main conversation was not returned by conversation retrieval. The actual design artifact and the visible project decisions were used for implementation.

## Implemented in this release

- Integrated the prototype into the existing application, with the exact supplied crest.
- Retained the existing background image and its motion; added no new imagery.
- Four homepage sections with functional navigation. Approved operating-company content retained; prototype placeholder Contact/Legal links omitted.
- Applied the public design consistently to Company Profile and Operating Model.
- Company Profile remains database-backed with the existing Edit / Save draft / Publish workflow. No database migration or content overwrite is performed by this release.
- Control Room remains protected by application login. Both private routes redirect anonymous requests to `/login`.
- Existing noindex/nofollow and restrictive robots behavior retained.

## Release procedure

- Download `immobiliare-holdings-release-20260906.tgz`; upload through WinSCP to `/opt/`.
- In PuTTY run:

```bash
tar -xzf /opt/immobiliare-holdings-release-20260906.tgz -C /opt && bash /opt/immobiliare-holdings-release-20260906/install.sh
```

- Installer preserves the existing environment, Compose configuration, Caddy, DNS and TLS settings.
- Installer keeps the previous source and image, builds before switching containers, verifies the new homepage marker, public pages, crest bytes and anonymous CR redirects, and attempts rollback if a step fails.
- Success is reported as `DEPLOYMENT_OK` only after the origin checks pass. Recovery files remain root-readable on the server.

## Actual deployment status

- Production installation completed, confirmed by the user's installer output on 6 September 2026:

```text
DEPLOYMENT_OK
Installed: 2026-09-06-heraldic-v1
Recovery files: /opt/holdings-backup-20260906-8HUxzr
```

- The installer reported success only after checking the release marker, public pages, exact crest bytes and anonymous login redirects on the running server.
- The design integration and deployment task is complete. No further upload or rebuild is pending for this release.
- Production build passed. All seven existing rendering/component tests passed; the Company Profile test verifies published CMS data with a controlled response.
- Additional checks verified the four homepage navigation targets, exact crest bytes, the existing hero media, release marker and both anonymous CR redirects.
- Installer syntax passed. Command simulations passed for successful installation, build failure and failed startup, including configuration preservation and source/image recovery commands. These are simulations, not a live Docker deployment test.
- External unauthenticated check on 6 September returned HTTP 401 with Basic authentication. That establishes reachability, not the deployed application version.
- No authenticated server session is available to this Build chat. Plugin discovery found no Hetzner management integration. Prior direct SSH / web-console limitations remain unresolved.
- The user-provided installer result is the evidence for production completion; no independent authenticated browser inspection has been performed.
- Public Company Profile publishing was already reported working before this design release. End-to-end authenticated save/publish was not repeated against production in this turn.
- This current status supersedes the pre-installation status snapshot inside the unchanged release archive.
