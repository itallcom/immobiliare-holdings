#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

source_dir="${1:?source checkout required}"
revision="${2:?revision required}"
app_dir=/opt/holdings
lock=/opt/holdings-deploy.lock

[[ $EUID == 0 ]] || { echo 'Deployment helper requires root.' >&2; exit 1; }
[[ -f "$source_dir/package-lock.json" && -f "$source_dir/Dockerfile" ]] || exit 1
[[ -f "$app_dir/.env.local" && -f "$app_dir/compose.yaml" ]] || exit 1
exec 9>"$lock"
flock -n 9 || { echo 'Another deployment is active.' >&2; exit 1; }

container_id="$(cd "$app_dir" && docker compose ps --quiet holdings)"
[[ -n "$container_id" ]] || exit 1
old_image="$(docker inspect --format '{{.Image}}' "$container_id")"
image_ref="$(docker inspect --format '{{.Config.Image}}' "$container_id")"
backup_dir="$(mktemp -d /opt/holdings-backup-auto-XXXXXX)"
tar --exclude='./node_modules' --exclude='./dist' --exclude='./.git' \
  --exclude='./.env.local' --exclude='./compose.yaml' \
  -czf "$backup_dir/source.tgz" -C "$app_dir" .

cutover=0
recover() {
  code=$?
  trap - ERR
  set +e
  tar -xzf "$backup_dir/source.tgz" -C "$app_dir"
  if [[ $cutover == 1 ]]; then
    docker image tag "$old_image" "$image_ref"
    (cd "$app_dir" && docker compose up -d --no-build --no-deps holdings)
  fi
  echo "DEPLOYMENT_FAILED revision=$revision recovery=$backup_dir" >&2
  exit "$code"
}
trap recover ERR

tar --exclude='.git' --exclude='.github' --exclude='.env*' --exclude='compose.yaml' \
  --exclude='node_modules' --exclude='dist' --exclude='.wrangler' \
  -cf - -C "$source_dir" . | tar -xf - -C "$app_dir"
(cd "$app_dir" && docker compose build holdings)
cutover=1
(cd "$app_dir" && docker compose up -d --no-build --no-deps holdings)

ready=0
for attempt in {1..30}; do
  if curl --silent --fail --max-time 8 http://127.0.0.1:3000/ -o "$backup_dir/home.html"; then
    ready=1
    break
  fi
  sleep 2
done
[[ $ready == 1 ]]
curl --silent --fail --max-time 15 http://127.0.0.1:3000/company -o /dev/null
curl --silent --fail --max-time 15 http://127.0.0.1:3000/operating-model -o /dev/null
printf '%s\n' "$revision" > "$app_dir/DEPLOYED_REVISION"
trap - ERR
echo "DEPLOYMENT_OK revision=$revision recovery=$backup_dir"
