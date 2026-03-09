import paramiko, time

KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"
USER = "root"
REMOTE_DIR = "/opt/kontaktformular"

key = paramiko.RSAKey.from_private_key_file(KEY_FILE)
client = None
for attempt in range(20):
    try:
        c = paramiko.SSHClient()
        c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        c.connect(HOST, username=USER, pkey=key, timeout=20, banner_timeout=30)
        client = c
        break
    except Exception as e:
        print(f"  Attempt {attempt+1}/20 failed. Retrying in 20s...")
        time.sleep(20)

if not client:
    print("Could not connect.")
    exit(1)
print("Connected!")

def run(cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    if out: print("  " + out[:300])
    return out

# Update NODE_ENV in .env
run(f"sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' {REMOTE_DIR}/.env")
print("NODE_ENV set to production")

# Verify
run(f"grep NODE_ENV {REMOTE_DIR}/.env")

# Restart PM2
run(f"cd {REMOTE_DIR} && pm2 restart kontaktformular --update-env 2>/dev/null || pm2 start build/index.js --name kontaktformular", timeout=60)
run("pm2 save --force 2>/dev/null | tail -2", timeout=30)
print("PM2 restarted")

# Health check
run("sleep 2 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health", timeout=15)

client.close()
print("Done!")
