import paramiko, time, sys, os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"
REMOTE_DIR = "/opt/kontaktformular"

def connect():
    key = paramiko.RSAKey.from_private_key_file(KEY_FILE)
    for attempt in range(20):
        try:
            c = paramiko.SSHClient()
            c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            c.connect(HOST, username='root', pkey=key, timeout=20, banner_timeout=30)
            return c
        except:
            print(f"  Attempt {attempt+1} failed, retrying...")
            time.sleep(20)

def run(client, cmd, label="", timeout=60):
    print(f"\n{'='*50}")
    print(f"  {label or cmd[:70]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print(out[:600])
    if err and 'WARNING' not in err: print("ERR:", err[:300])
    return out

def upload_dir(sftp, local, remote):
    try: sftp.mkdir(remote)
    except: pass
    for item in os.listdir(local):
        lp = os.path.join(local, item)
        rp = remote + "/" + item
        if os.path.isdir(lp): upload_dir(sftp, lp, rp)
        else: sftp.put(lp, rp)

client = connect()
print("Connected!\n")

# --- 1. UFW Firewall ---
print("\n### UFW FIREWALL ###")
run(client, "apt-get install -y ufw 2>&1 | tail -3", "Install UFW", timeout=120)
run(client, "ufw --force reset 2>&1 | tail -2", "Reset UFW")
run(client, "ufw default deny incoming", "Deny all incoming")
run(client, "ufw default allow outgoing", "Allow all outgoing")
run(client, "ufw allow 22/tcp comment 'SSH'", "Allow SSH")
run(client, "ufw allow 80/tcp comment 'HTTP'", "Allow HTTP")
run(client, "ufw allow 443/tcp comment 'HTTPS'", "Allow HTTPS")
# Block port 3000 from public (only localhost/Caddy needs it)
run(client, "ufw deny 3000/tcp comment 'Block direct app access'", "Block port 3000")
run(client, "ufw --force enable 2>&1", "Enable UFW")
run(client, "ufw status verbose 2>&1", "UFW status")

# --- 2. fail2ban ---
print("\n### FAIL2BAN ###")
run(client, "apt-get install -y fail2ban 2>&1 | tail -3", "Install fail2ban", timeout=120)

JAIL_LOCAL = """[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled  = true
port     = ssh
maxretry = 4
bantime  = 2h
"""
sftp = client.open_sftp()
with sftp.open('/etc/fail2ban/jail.local', 'w') as f:
    f.write(JAIL_LOCAL)
sftp.close()

run(client, "systemctl enable fail2ban && systemctl restart fail2ban 2>&1", "Start fail2ban")
run(client, "systemctl is-active fail2ban", "fail2ban status")
run(client, "fail2ban-client status sshd 2>&1", "fail2ban sshd jail")

# --- 3. Deploy new build (login rate limit + CSP) ---
print("\n### DEPLOY NEW BUILD ###")
run(client, f"rm -rf {REMOTE_DIR}/build", "Remove old build")
sftp = client.open_sftp()
upload_dir(sftp, r"C:\temp\Kontaktformular\build", f"{REMOTE_DIR}/build")
sftp.close()
print("  Build uploaded")

run(client, f"cd {REMOTE_DIR} && pm2 restart kontaktformular --update-env 2>&1 | cat", "PM2 restart", timeout=30)
run(client, "sleep 2 && curl -s -o /dev/null -w 'HTTP %{http_code}' http://localhost:3000/api/health", "Health check")

# --- Summary ---
print("\n### FINAL STATUS ###")
run(client, "ufw status 2>&1 | head -15", "Firewall rules")
run(client, "systemctl is-active fail2ban ufw 2>&1", "Services")

client.close()
print("\n\nDone! Server hardened.")
