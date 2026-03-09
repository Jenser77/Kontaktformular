import paramiko, time, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"

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

def run(client, cmd, label="", timeout=10):
    print(f"\n[{label or cmd[:50]}]")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    print(out or err or "(no output)")
    return out

client = connect()
print("Connected!\n")

run(client, "ufw status 2>/dev/null || echo 'UFW not active'", "Firewall (UFW)")
run(client, "systemctl is-active fail2ban 2>/dev/null || echo 'fail2ban not running'", "fail2ban")
run(client, "ss -tlnp | grep -v '127.0.0.1'", "Open ports (public)")
run(client, "grep -E 'PermitRootLogin|PasswordAuthentication|Port ' /etc/ssh/sshd_config 2>/dev/null | grep -v '^#'", "SSH config")
run(client, "unattended-upgrades --dry-run 2>/dev/null | head -3 || echo 'unattended-upgrades not configured'", "Auto-updates")

client.close()
