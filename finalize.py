import paramiko, time, sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"
REMOTE_DIR = "/opt/kontaktformular"
MIGRATION = "20260305074508_init_postgres"

def connect():
    key = paramiko.RSAKey.from_private_key_file(KEY_FILE)
    for attempt in range(20):
        try:
            c = paramiko.SSHClient()
            c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            c.connect(HOST, username='root', pkey=key, timeout=20, banner_timeout=30)
            return c
        except Exception as e:
            print(f"  Attempt {attempt+1} failed. Retrying in 20s...")
            time.sleep(20)
    raise RuntimeError("Could not connect")

def run(client, cmd, timeout=60):
    print(f"  >> {cmd[:70]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print("    " + out[:500].replace("\n", "\n    "))
    if err and '[PM2]' not in err: print("    ERR: " + err[:300])
    return out

print("Connecting...")
client = connect()
print("Connected!\n")

# 1. Baseline migration (mark as already applied)
print("--- Prisma baseline ---")
run(client, f"cd {REMOTE_DIR} && npx prisma migrate resolve --applied {MIGRATION} 2>&1", timeout=30)

# 2. Verify migrate deploy now works
print("\n--- Prisma migrate deploy ---")
run(client, f"cd {REMOTE_DIR} && npx prisma migrate deploy 2>&1", timeout=60)

# 3. PM2 restart
print("\n--- PM2 restart ---")
run(client, f"cd {REMOTE_DIR} && pm2 restart kontaktformular --update-env 2>&1 | grep -v '\\\\u' | cat", timeout=60)
run(client, "pm2 save --force 2>&1 | grep -i 'saved\\|error'", timeout=30)

# 4. Health check
print("\n--- Health check ---")
out = run(client, "sleep 2 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health", timeout=15)
print(f"HTTP status: {out}")

client.close()
print("\nDone!")
