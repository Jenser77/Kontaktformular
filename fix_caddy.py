import paramiko, time, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"
REMOTE_DIR = "/opt/kontaktformular"

NEW_CADDYFILE = """# Caddyfile fuer das Kontaktformular-System

46.225.170.106.sslip.io, portal.diakoniestiftung-sachsen.de {
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "geolocation=(), microphone=(), camera=()"
    }

    reverse_proxy localhost:3000 {
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}

www.portal.diakoniestiftung-sachsen.de {
    redir https://portal.diakoniestiftung-sachsen.de{uri}
}
"""

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

def run(client, cmd, timeout=30):
    print(f">> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print("  " + out[:400].replace("\n", "\n  "))
    if err: print("  ERR: " + err[:300])
    return out

client = connect()
print("Connected!\n")

# Write new Caddyfile
sftp = client.open_sftp()
with sftp.open(REMOTE_DIR + '/Caddyfile', 'w') as f:
    f.write(NEW_CADDYFILE)
sftp.close()
print("Caddyfile updated")

# Validate and reload
run(client, f"caddy validate --config {REMOTE_DIR}/Caddyfile 2>&1")
run(client, f"caddy reload --config {REMOTE_DIR}/Caddyfile 2>&1", timeout=15)
run(client, "systemctl status caddy --no-pager -l | head -10")

client.close()
print("\nDone! Try https://46.225.170.106.sslip.io/admin")
