"""
Deploy SvelteKit build to /opt/kontaktformular on the remote server.
Single SSH session: SFTP upload + remote commands.
"""
import paramiko
import os
import sys
import time

KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"
USER = "root"
LOCAL_BUILD = r"C:\temp\Kontaktformular\build"
LOCAL_PACKAGE = r"C:\temp\Kontaktformular\package.json"
REMOTE_DIR = "/opt/kontaktformular"

def run(client, cmd, label="", timeout=30):
    print(f"  >> {label or cmd[:60]}")
    try:
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        if out:
            print("    " + out.replace("\n", "\n    "))
        if err and not err.startswith('[PM2]'):
            print("    STDERR: " + err[:300].replace("\n", "\n    STDERR: "))
        return out
    except Exception as e:
        print(f"    TIMEOUT/ERROR: {e}")
        return ""

def sftp_upload_dir(sftp, local_dir, remote_dir):
    try:
        sftp.mkdir(remote_dir)
    except IOError:
        pass
    count = 0
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + "/" + item
        if os.path.isdir(local_path):
            sftp_upload_dir(sftp, local_path, remote_path)
        else:
            sftp.put(local_path, remote_path)
            count += 1
            if count % 10 == 0:
                sys.stdout.write(f" {count}")
                sys.stdout.flush()
    return count

# Connect with retry
print("Connecting to", HOST)
key = paramiko.RSAKey.from_private_key_file(KEY_FILE)
client = None
for attempt in range(30):
    try:
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        c.connect(HOST, username=USER, pkey=key, timeout=20, banner_timeout=30)
        client = c
        break
    except Exception as e:
        msg = str(e)[:50]
        print(f"  Attempt {attempt+1}/30 failed: {msg}. Retrying in 20s...")
        time.sleep(20)

if client is None:
    print("Could not connect after 30 attempts.")
    sys.exit(1)
print("Connected!\n")

# 1. Upload build/
print("--- Uploading build/ ---")
sftp = client.open_sftp()

# Remove old build and recreate
run(client, f"rm -rf {REMOTE_DIR}/build_old && mv {REMOTE_DIR}/build {REMOTE_DIR}/build_old 2>/dev/null; mkdir -p {REMOTE_DIR}/build", "prepare build dir")

sftp_upload_dir(sftp, LOCAL_BUILD, REMOTE_DIR + "/build")
print(f"\nBuild uploaded!")

# Upload package.json
sftp.put(LOCAL_PACKAGE, REMOTE_DIR + "/package.json")
print("package.json uploaded!")
sftp.close()

# 2. Install/update deps on server
print("\n--- npm install --omit=dev ---")
run(client, f"cd {REMOTE_DIR} && npm install --omit=dev 2>&1 | tail -5", "npm install", timeout=120)

# 3. PM2 restart or start
print("\n--- PM2 restart/start ---")

# Use pm2 startOrRestart pattern
pm2_cmd = (
    f"cd {REMOTE_DIR} && "
    f"pm2 describe kontaktformular > /dev/null 2>&1 && "
    f"pm2 restart kontaktformular --update-env || "
    f"pm2 start build/index.js --name kontaktformular"
)
run(client, pm2_cmd, "pm2 startOrRestart", timeout=60)

run(client, "pm2 save --force", "pm2 save", timeout=30)

# 4. Check status
print("\n--- App status ---")
run(client, "pm2 describe kontaktformular 2>/dev/null | grep -E 'name|status|pid|uptime|restarts' | head -10", "pm2 describe", timeout=30)

print("\n--- Curl test ---")
run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health 2>/dev/null || curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 'curl failed'", "health check", timeout=15)

client.close()
print("\nDeployment done!")
