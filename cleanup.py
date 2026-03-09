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

client = connect()
print("Connected!")

stdin, stdout, stderr = client.exec_command("rm -f /opt/kontaktformular/formular_seg_private.ppk && echo 'Deleted' || echo 'Not found'", timeout=10)
print(stdout.read().decode().strip())

# Verify
stdin, stdout, stderr = client.exec_command("ls /opt/kontaktformular/*.ppk 2>/dev/null || echo 'No PPK files remaining'", timeout=10)
print(stdout.read().decode().strip())

client.close()
