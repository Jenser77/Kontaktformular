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
            print(f"  Attempt {attempt+1} failed. Retrying in 20s...")
            time.sleep(20)

def run(client, cmd, timeout=15):
    print(f">> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print("  " + out[:600].replace("\n", "\n  "))
    if err: print("  ERR: " + err[:200])
    return out

client = connect()
print("Connected!\n")

run(client, "systemctl is-active caddy 2>/dev/null || echo 'caddy not systemd'")
run(client, "caddy version 2>/dev/null || echo 'caddy not found'")
run(client, "ss -tlnp | grep -E '443|80|3000'")
run(client, "cat /opt/kontaktformular/Caddyfile")

client.close()
