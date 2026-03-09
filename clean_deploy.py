import paramiko, time, sys, os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"
REMOTE_DIR = "/opt/kontaktformular"
LOCAL_BUILD = r"C:\temp\Kontaktformular\build"

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

def run(client, cmd, timeout=60):
    print(f">> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print(" ", out[:600].replace("\n", "\n  "))
    if err and '[PM2]' not in err: print("  ERR:", err[:200])
    return out

def sftp_upload_dir(sftp, local_dir, remote_dir):
    try: sftp.mkdir(remote_dir)
    except IOError: pass
    for item in os.listdir(local_dir):
        lp = os.path.join(local_dir, item)
        rp = remote_dir + "/" + item
        if os.path.isdir(lp):
            sftp_upload_dir(sftp, lp, rp)
        else:
            sftp.put(lp, rp)

client = connect()
print("Connected!\n")

# Delete old build completely, then re-upload
print(">> Deleting old build/...")
run(client, f"rm -rf {REMOTE_DIR}/build")

print(">> Uploading fresh build/...")
sftp = client.open_sftp()
sftp_upload_dir(sftp, LOCAL_BUILD, REMOTE_DIR + "/build")
sftp.close()
print("  Done")

# Restart via ecosystem config (has correct env vars)
run(client, f"cd {REMOTE_DIR} && pm2 restart kontaktformular --update-env 2>&1 | cat", timeout=30)
run(client, "pm2 save --force 2>&1 | grep -i saved", timeout=20)

# Health + error check
run(client, "sleep 2 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health")
run(client, "tail -3 /root/.pm2/logs/kontaktformular-error.log 2>&1")

client.close()
print("\nDone!")
