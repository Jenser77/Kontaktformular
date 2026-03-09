import paramiko, time, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"
REMOTE_DIR = "/opt/kontaktformular"

ADMIN_USERS = '[{"user":"admin","pass":"Adri2305###"},{"user":"katjal","pass":"KL2026!TEST"}]'

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

def run(client, cmd, timeout=30):
    print(f">> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print(" ", out[:300])
    if err: print("  ERR:", err[:200])
    return out

client = connect()
print("Connected!\n")

# Add ADMIN_USERS to .env (remove old line if exists, then append)
run(client, f"sed -i '/^ADMIN_USERS=/d' {REMOTE_DIR}/.env")
run(client, f"echo 'ADMIN_USERS={ADMIN_USERS}' >> {REMOTE_DIR}/.env")
run(client, f"grep ADMIN {REMOTE_DIR}/.env")

# Update ecosystem.config.cjs
run(client, f"sed -i \"/ADMIN_USERS/d\" {REMOTE_DIR}/ecosystem.config.cjs")
run(client, f"""sed -i "/ADMIN_PASS/a\\      ADMIN_USERS: '{ADMIN_USERS}'," {REMOTE_DIR}/ecosystem.config.cjs""")
run(client, f"grep -A2 'ADMIN_PASS' {REMOTE_DIR}/ecosystem.config.cjs")

# Upload new build and restart
sftp = client.open_sftp()

import os
def upload_dir(sftp, local, remote):
    try: sftp.mkdir(remote)
    except: pass
    for item in os.listdir(local):
        lp = os.path.join(local, item)
        rp = remote + "/" + item
        if os.path.isdir(lp): upload_dir(sftp, lp, rp)
        else: sftp.put(lp, rp)

run(client, f"rm -rf {REMOTE_DIR}/build")
print("Uploading build...")
upload_dir(sftp, r"C:\temp\Kontaktformular\build", f"{REMOTE_DIR}/build")
sftp.close()
print("Done")

run(client, f"cd {REMOTE_DIR} && pm2 restart kontaktformular --update-env 2>&1 | cat", timeout=30)
run(client, "sleep 2 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health")

client.close()
print("\nDone!")
