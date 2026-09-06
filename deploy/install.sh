#!/usr/bin/env bash
# Install the bundled application into the existing Hetzner deployment.
set -Eeuo pipefail
umask 077

release_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
app_dir=/opt/holdings
release_id=2026-09-06-heraldic-v1

for required in docker curl tar sha256sum flock grep cmp mktemp; do
  command -v "$required" >/dev/null || { echo "Missing command: $required" >&2; exit 1; }
done
[[ $EUID == 0 ]] || { echo 'Run this installer as root.' >&2; exit 1; }
[[ -f "$release_dir/source.tgz" && -f "$release_dir/SHA256SUMS" ]] || exit 1
[[ -d "$app_dir" && -f "$app_dir/.env.local" ]] || { echo 'The existing application or configuration is missing.' >&2; exit 1; }
exec 9>/opt/holdings-deploy.lock
flock -n 9 || { echo 'Another deployment is in progress.' >&2; exit 1; }
(cd "$release_dir" && sha256sum --check SHA256SUMS)
cd "$app_dir"
docker compose config --quiet
container_id="$(docker compose ps --quiet holdings)"
[[ -n "$container_id" ]] || { echo 'The existing holdings service is not running.' >&2; exit 1; }
old_image="$(docker inspect --format '{{.Image}}' "$container_id")"
image_ref="$(docker inspect --format '{{.Config.Image}}' "$container_id")"
backup_dir="$(mktemp -d /opt/holdings-backup-20260906-XXXXXX)"
tar --exclude='./node_modules' --exclude='./dist' --exclude='./.git' \
    --exclude='./.wrangler' --exclude='./.sites-runtime' \
    -czf "$backup_dir/source.tgz" -C "$app_dir" .
docker image tag "$old_image" "holdings-rollback:$(basename "$backup_dir")"
printf '%s\n' "$old_image" > "$backup_dir/image-id"
cutover=0

recover() {
  local failure=$?
  trap - ERR
  set +e
  echo 'Deployment failed. Restoring the previous version.' >&2
  tar -xzf "$backup_dir/source.tgz" -C "$app_dir"
  local restored=$?
  if [[ $cutover == 1 ]]; then
    docker image tag "$old_image" "$image_ref"
    docker compose up -d --no-build --no-deps holdings
    [[ $? == 0 ]] || restored=1
  fi
  if [[ $restored == 0 ]]; then
    echo "Previous source restored. Recovery files: $backup_dir" >&2
  else
    echo "Automatic recovery needs attention. Recovery files: $backup_dir" >&2
  fi
  echo 'DEPLOYMENT_FAILED' >&2
  exit "$failure"
}
trap recover ERR

# source.tgz deliberately contains no environment, Compose or Caddy configuration.
tar -xzf "$release_dir/source.tgz" -C "$app_dir"
# A failed build leaves the running container in place.
docker compose build holdings
cutover=1
docker compose up -d --no-build --no-deps holdings

origin=http://127.0.0.1:3000
ready=0
for attempt in {1..30}; do
  if curl --silent --show-error --fail --max-time 8 "$origin/" -o "$backup_dir/home.html" \
      && grep -Fq "data-release=\"$release_id\"" "$backup_dir/home.html"; then
    ready=1
    break
  fi
  sleep 2
done
[[ $ready == 1 ]]
curl --silent --show-error --fail --max-time 20 "$origin/company" -o "$backup_dir/company.html"
grep -Fq 'public-profile-copy' "$backup_dir/company.html"
curl --silent --show-error --fail --max-time 15 "$origin/operating-model" -o "$backup_dir/model.html"
grep -Fq 'public-responsibility-table' "$backup_dir/model.html"
curl --silent --show-error --fail --max-time 15 "$origin/immobiliare-crest.png" -o "$backup_dir/crest.png"
cmp "$app_dir/public/immobiliare-crest.png" "$backup_dir/crest.png"

# Verify both private routes still send an unauthenticated request to login.
for route in /control-room /control-room/company-profile; do
  status="$(curl --silent --show-error --max-time 15 -D "$backup_dir/auth-headers" -o /dev/null -w '%{http_code}' "$origin$route")"
  [[ "$status" =~ ^(302|303|307|308)$ ]]
  grep -Eiq '^location: .*/?login([/?[:space:]]|$)' "$backup_dir/auth-headers"
done
trap - ERR
printf '%s\n' "$release_id" > "$app_dir/DEPLOYED_RELEASE"
echo 'DEPLOYMENT_OK'
echo "Installed: $release_id"
echo "Recovery files: $backup_dir"
