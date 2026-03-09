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

def run(client, cmd, timeout=30):
    print(f">> {cmd[:90]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print("  " + out[:600].replace("\n", "\n  "))
    if err: print("  ERR: " + err[:300])
    return out

client = connect()
print("Connected!\n")

# Read .env from server
print(">> Reading .env from server")
stdin, stdout, stderr = client.exec_command(f"cat {REMOTE_DIR}/.env", timeout=10)
env_content = stdout.read().decode(errors='replace')

# Parse .env into key=value dict
env_vars = {}
for line in env_content.splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    key, _, val = line.partition('=')
    val = val.strip().strip('"').strip("'")
    env_vars[key.strip()] = val

print("  Parsed env vars:", list(env_vars.keys()))

# Build ecosystem.config.cjs
env_block = "\n".join(f'      {k}: {repr(v)},' for k, v in env_vars.items())
ecosystem = f"""module.exports = {{
  apps: [{{
    name: 'kontaktformular',
    script: './build/index.js',
    cwd: '{REMOTE_DIR}',
    env: {{
{env_block}
    }}
  }}]
}};
"""

# Upload ecosystem config
sftp = client.open_sftp()
with sftp.open(f"{REMOTE_DIR}/ecosystem.config.cjs", 'w') as f:
    f.write(ecosystem)
sftp.close()
print("ecosystem.config.cjs uploaded")

# Stop old process and start fresh with ecosystem
run(client, f"cd {REMOTE_DIR} && pm2 delete kontaktformular 2>/dev/null; pm2 start ecosystem.config.cjs 2>&1 | tail -5", timeout=60)
run(client, "pm2 save --force 2>&1 | tail -2", timeout=20)

# Health check
run(client, "sleep 2 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/health", timeout=15)

# Check for DB errors
run(client, "pm2 logs kontaktformular --err --nostream --lines 10 2>&1 | tail -15", timeout=15)

client.close()
print("\nDone!")
