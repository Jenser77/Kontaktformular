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

def run(client, cmd, timeout=15):
    print(f">> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    if out: print(out[:1000])
    return out

client = connect()
print("Connected!\n")

# Which prisma chunk does the server entry use?
run(client, "grep 'prisma' /opt/kontaktformular/build/server/index.js | head -5")
# What does the new prisma chunk look like?
run(client, "head -10 /opt/kontaktformular/build/server/chunks/prisma-gEL0ypZB.js")
# Clean up old chunks - delete old build files not in new build
run(client, "ls /opt/kontaktformular/build/server/chunks/ | wc -l")

client.close()
