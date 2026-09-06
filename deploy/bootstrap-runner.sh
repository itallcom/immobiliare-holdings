#!/usr/bin/env bash
# Run once on the Hetzner server after GitHub provides its current runner commands.
set -Eeuo pipefail

runner_user=github-runner
runner_dir=/opt/actions-runner
[[ $EUID == 0 ]] || exit 1
id "$runner_user" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash "$runner_user"
install -d -o "$runner_user" -g "$runner_user" "$runner_dir"
install -o root -g root -m 0750 deploy/deploy-from-runner.sh /usr/local/sbin/deploy-immobiliare
cat >/etc/sudoers.d/immobiliare-deploy <<'EOF'
github-runner ALL=(root) NOPASSWD: /usr/local/sbin/deploy-immobiliare
EOF
chmod 0440 /etc/sudoers.d/immobiliare-deploy
visudo -cf /etc/sudoers.d/immobiliare-deploy
echo 'SERVER_PREPARED'
echo 'Complete the GitHub-generated runner registration commands as github-runner in /opt/actions-runner.'
