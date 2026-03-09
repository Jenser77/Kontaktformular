"""Full sync: build/, static/, prisma/ (no dev.db), package.json → server"""
import paramiko, os, sys, time

KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"
USER = "root"
LOCAL_ROOT = r"C:\temp\Kontaktformular"
REMOTE_DIR = "/opt/kontaktformular"

UPLOAD_DIRS = ["build", "static", "prisma"]
UPLOAD_FILES = ["package.json"]
SKIP_FILES = {"dev.db"}  # never upload local SQLite dev db

def connect():
    key = paramiko.RSAKey.from_private_key_file(KEY_FILE)
    for attempt in range(30):
        try:
            c = paramiko.SSHClient()
            c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            c.connect(HOST, username=USER, pkey=key, timeout=20, banner_timeout=30)
            return c
        except Exception as e:
            print(f"  Attempt {attempt+1}/30 failed. Retrying in 20s...")
            time.sleep(20)
    raise RuntimeError("Could not connect after 30 attempts")

def run(client, cmd, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print("  " + out[:400].replace("\n", "\n  "))
    if err and not err.startswith('[PM2]'): print("  ERR: " + err[:200])
    return out

def sftp_upload_dir(sftp, local_dir, remote_dir):
    try: sftp.mkdir(remote_dir)
    except IOError: pass
    total = 0
    for item in os.listdir(local_dir):
        if item in SKIP_FILES:
            print(f"  Skipping {item}")
            continue
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + "/" + item
        if os.path.isdir(local_path):
            total += sftp_upload_dir(sftp, local_path, remote_path)
        else:
            sftp.put(local_path, remote_path)
            total += 1
    return total

print("Connecting...")
client = connect()
print("Connected!\n")

sftp = client.open_sftp()

for d in UPLOAD_DIRS:
    local = os.path.join(LOCAL_ROOT, d)
    remote = REMOTE_DIR + "/" + d
    print(f"Uploading {d}/...")
    n = sftp_upload_dir(sftp, local, remote)
    print(f"  {n} files uploaded")

for f in UPLOAD_FILES:
    local = os.path.join(LOCAL_ROOT, f)
    remote = REMOTE_DIR + "/" + f
    sftp.put(local, remote)
    print(f"Uploaded {f}")

sftp.close()

print("\n--- npm install --omit=dev ---")
run(client, f"cd {REMOTE_DIR} && npm install --omit=dev 2>&1 | tail -3", timeout=120)

print("\n--- Prisma migrate deploy ---")
run(client, f"cd {REMOTE_DIR} && npx prisma migrate deploy 2>&1", timeout=60)

print("\n--- PM2 restart ---")
run(client, f"cd {REMOTE_DIR} && pm2 restart kontaktformular --update-env 2>/dev/null || pm2 start build/index.js --name kontaktformular", timeout=60)
run(client, "pm2 save --force 2>/dev/null | tail -2", timeout=30)

print("\n--- Health check ---")
run(client, "sleep 2 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health", timeout=15)

client.close()
print("\nSync complete!")
