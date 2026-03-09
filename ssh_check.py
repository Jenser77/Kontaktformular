import paramiko
import sys

key_file = r"C:\temp\Kontaktformular\id_rsa_deploy"
host = "46.225.170.106"
user = "root"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
key = paramiko.RSAKey.from_private_key_file(key_file)
client.connect(host, username=user, pkey=key, timeout=15)

cmd = sys.argv[1] if len(sys.argv) > 1 else "echo OK"
stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
out = stdout.read().decode()
err = stderr.read().decode()
print(out, end="")
if err:
    print("STDERR:", err, file=sys.stderr)

client.close()
