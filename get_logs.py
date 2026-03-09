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
            print(f"  Attempt {attempt+1} failed, retrying...")
            time.sleep(20)

def run(client, cmd, timeout=20):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    combined = (out + "\n" + err).strip()
    if combined: print(combined[:3000])
    return out

client = connect()
print("=== PM2 error log (last 30 lines) ===")
run(client, "tail -30 /root/.pm2/logs/kontaktformular-error.log 2>&1")
print("\n=== Env check ===")
run(client, "pm2 env 0 2>&1 | grep -E 'DATABASE_URL|NODE_ENV|PORT'")
client.close()
