#!/usr/bin/env bash
# One-time installation of the repository's deployment runner on Hetzner.
set -Eeuo pipefail

runner_user=github-runner
runner_dir=/opt/actions-runner
repository_url=https://github.com/itallcom/immobiliare-holdings
[[ $EUID == 0 ]] || exit 1
for command in curl python3 tar runuser systemctl install visudo; do
  command -v "$command" >/dev/null || { echo "Missing command: $command" >&2; exit 1; }
done

printf 'Paste the temporary runner token from GitHub and press Enter: '
read -rs runner_token
echo
[[ -n "$runner_token" ]] || exit 1

id "$runner_user" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash "$runner_user"
install -d -o "$runner_user" -g "$runner_user" "$runner_dir"
install -o root -g root -m 0750 deploy/deploy-from-runner.sh /usr/local/sbin/deploy-immobiliare
cat >/etc/sudoers.d/immobiliare-deploy <<'EOF'
github-runner ALL=(root) NOPASSWD: /usr/local/sbin/deploy-immobiliare
EOF
chmod 0440 /etc/sudoers.d/immobiliare-deploy
visudo -cf /etc/sudoers.d/immobiliare-deploy

release_json="$(curl --fail --silent --show-error https://api.github.com/repos/actions/runner/releases/latest)"
runner_url="$(python3 -c 'import json,sys; d=json.load(sys.stdin); print(next(a["browser_download_url"] for a in d["assets"] if a["name"].startswith("actions-runner-linux-x64-") and a["name"].endswith(".tar.gz")))' <<<"$release_json")"
archive="$(mktemp /tmp/actions-runner-XXXXXX.tar.gz)"
curl --fail --location --show-error --output "$archive" "$runner_url"
tar -xzf "$archive" -C "$runner_dir"
rm -f "$archive"
chown -R "$runner_user:$runner_user" "$runner_dir"

if [[ ! -f "$runner_dir/.runner" ]]; then
  (
    cd "$runner_dir"
    runuser -u "$runner_user" -- ./config.sh \
      --unattended --replace \
      --url "$repository_url" \
      --token "$runner_token" \
      --name immobiliare-hetzner \
      --labels immobiliare-production \
      --work _work
  )
fi
unset runner_token

(
  cd "$runner_dir"
  ./svc.sh install "$runner_user"
  ./svc.sh start
  ./svc.sh status
)
echo 'RUNNER_READY'
