import paramiko, time, sys, base64
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

def run(client, cmd, timeout=15):
    print(f">> {cmd[:90]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    if out: print(" ", out[:800])
    return out

client = connect()
print("Connected!\n")

# Get log line count before request
run(client, "wc -l /root/.pm2/logs/kontaktformular-error.log")

# Hit the admin page with basic auth
creds = base64.b64encode(b"admin:Adri2305###").decode()
run(client, f'curl -s -o /dev/null -w "%{{http_code}}" -H "Authorization: Basic {creds}" http://localhost:3000/admin')

# Check for new errors
run(client, "tail -5 /root/.pm2/logs/kontaktformular-error.log 2>&1")

client.close()
