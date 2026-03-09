import paramiko, time, sys
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

def run(client, cmd, timeout=15):
    print(f"\n>> {cmd[:90]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print(out[:800])
    if err: print("ERR:", err[:400])
    return out

client = connect()
print("Connected!")

# Check if DB user exists
run(client, "sudo -u postgres psql -c '\\du kontakt_admin' 2>&1")
# Check if DB exists
run(client, "sudo -u postgres psql -c '\\l kontaktdb' 2>&1")
# Test connection with the actual credentials
run(client, "psql 'postgresql://kontakt_admin:Adel2305###@localhost:5432/kontaktdb' -c 'SELECT 1' 2>&1")
# Check prisma.config.ts
run(client, f"cat {REMOTE_DIR}/prisma.config.ts 2>/dev/null || echo NOT_FOUND")
# Check src/lib/server/prisma.ts in build
run(client, f"grep -n 'DATABASE_URL\\|connectionString\\|Pool' {REMOTE_DIR}/build/server/chunks/*.js 2>/dev/null | head -10")

client.close()
