"""
Export data from local postgres DB and import into remote server DB.
Tables: Contact, Mandant, Einrichtung, Fachabteilung
"""
import psycopg2
import paramiko
import time
import sys
import json

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

LOCAL_URL = "postgresql://postgres:Adel2305###@localhost:5432/postgres"
KEY_FILE = r"C:\temp\Kontaktformular\id_rsa_deploy"
HOST = "46.225.170.106"
REMOTE_DB = "postgresql://kontakt_admin:Adel2305###@localhost:5432/kontaktdb"

TABLES = [
    ("Mandant",       ["id", "name", "createdAt"]),
    ("Einrichtung",   ["id", "name", "mandantId", "createdAt"]),
    ("Fachabteilung", ["id", "name", "email", "einrichtungId", "createdAt"]),
    ("Contact",       ["id", "firstName", "lastName", "organization", "email",
                       "phone", "subject", "message", "privacyAccepted",
                       "targetRecipient", "createdAt"]),
]

# --- 1. Read local data ---
print("Reading local data...")
local_conn = psycopg2.connect(LOCAL_URL)
local_cur = local_conn.cursor()

table_data = {}
for table, cols in TABLES:
    col_list = ", ".join(f'"{c}"' for c in cols)
    local_cur.execute(f'SELECT {col_list} FROM public."{table}"')
    rows = local_cur.fetchall()
    table_data[table] = (cols, rows)
    print(f"  {table}: {len(rows)} rows")

local_cur.close()
local_conn.close()

# --- 2. Connect to remote server ---
def connect_ssh():
    key = paramiko.RSAKey.from_private_key_file(KEY_FILE)
    for attempt in range(20):
        try:
            c = paramiko.SSHClient()
            c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            c.connect(HOST, username='root', pkey=key, timeout=20, banner_timeout=30)
            return c
        except:
            print(f"  SSH attempt {attempt+1} failed, retrying...")
            time.sleep(20)

def run(client, cmd, timeout=30):
    print(f"  >> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors='replace').strip()
    err = stderr.read().decode(errors='replace').strip()
    if out: print("    " + out[:400])
    if err: print("    ERR: " + err[:200])
    return out

print("\nConnecting to server...")
ssh = connect_ssh()
print("Connected!")

# --- 3. Build and upload SQL ---
def escape(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    s = str(val).replace("'", "''")
    return f"'{s}'"

sql_lines = ["BEGIN;"]

for table, cols in TABLES:
    cols_list, rows = table_data[table]
    if not rows:
        continue
    sql_lines.append(f'\n-- {table} ({len(rows)} rows)')
    sql_lines.append(f'TRUNCATE TABLE public."{table}" CASCADE;')
    col_str = ", ".join(f'"{c}"' for c in cols_list)
    for row in rows:
        vals = ", ".join(escape(v) for v in row)
        sql_lines.append(f'INSERT INTO public."{table}" ({col_str}) VALUES ({vals});')

sql_lines.append("\nCOMMIT;")
sql = "\n".join(sql_lines)

# Upload SQL file
sftp = ssh.open_sftp()
with sftp.open("/tmp/migrate_kontakt.sql", 'w') as f:
    f.write(sql)
sftp.close()
print(f"\nUploaded SQL ({len(sql)} chars)")

# --- 4. Execute on server ---
print("\nImporting data...")
run(ssh, f"psql '{REMOTE_DB}' -f /tmp/migrate_kontakt.sql 2>&1 | tail -10", timeout=30)
run(ssh, "rm /tmp/migrate_kontakt.sql")

# Verify
print("\nVerifying row counts:")
for table, _ in TABLES:
    run(ssh, f"psql '{REMOTE_DB}' -t -c 'SELECT COUNT(*) FROM public.\"{table}\"' 2>&1")

ssh.close()
print("\nMigration complete!")
