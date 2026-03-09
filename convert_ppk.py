"""Convert PuTTY PPK v3 (unencrypted RSA) to OpenSSH PEM format."""
import base64
import struct

def encode_asn1_int(n):
    b = n.to_bytes((n.bit_length() + 8) // 8, 'big')
    while len(b) > 1 and b[0] == 0 and (b[1] & 0x80) == 0:
        b = b[1:]
    if b[0] & 0x80:
        b = b'\x00' + b
    return b'\x02' + encode_asn1_len(len(b)) + b

def encode_asn1_len(n):
    if n < 0x80:
        return bytes([n])
    elif n < 0x100:
        return bytes([0x81, n])
    else:
        return bytes([0x82, (n >> 8) & 0xff, n & 0xff])

def encode_asn1_seq(data):
    return b'\x30' + encode_asn1_len(len(data)) + data

# Parse PPK line by line
with open(r"C:\temp\Kontaktformular\formular_seg_private.ppk", 'r') as f:
    lines = f.read().splitlines()

i = 0
headers = {}
while i < len(lines):
    line = lines[i]
    if ': ' in line:
        key, val = line.split(': ', 1)
        if key in ('Public-Lines', 'Private-Lines'):
            count = int(val)
            blob_lines = lines[i+1:i+1+count]
            headers[key] = base64.b64decode(''.join(blob_lines))
            i += 1 + count
        else:
            headers[key] = val
            i += 1
    else:
        i += 1

pub_data = headers['Public-Lines']
priv_data = headers['Private-Lines']

# Parse public key blob: string(type) mpint(e) mpint(n)
def read_string(data, offset):
    length = struct.unpack('>I', data[offset:offset+4])[0]
    return data[offset+4:offset+4+length], offset+4+length

def read_mpint(data, offset):
    length = struct.unpack('>I', data[offset:offset+4])[0]
    value = int.from_bytes(data[offset+4:offset+4+length], 'big')
    return value, offset+4+length

offset = 0
key_type, offset = read_string(pub_data, offset)
e, offset = read_mpint(pub_data, offset)
n, offset = read_mpint(pub_data, offset)

# Parse private key blob: mpint(d) mpint(p) mpint(q) mpint(iqmp)
offset = 0
d, offset = read_mpint(priv_data, offset)
p, offset = read_mpint(priv_data, offset)
q, offset = read_mpint(priv_data, offset)
iqmp, offset = read_mpint(priv_data, offset)

dp = d % (p - 1)
dq = d % (q - 1)

body = (
    encode_asn1_int(0) +
    encode_asn1_int(n) +
    encode_asn1_int(e) +
    encode_asn1_int(d) +
    encode_asn1_int(p) +
    encode_asn1_int(q) +
    encode_asn1_int(dp) +
    encode_asn1_int(dq) +
    encode_asn1_int(iqmp)
)
der = encode_asn1_seq(body)
pem_b64 = base64.encodebytes(der).decode()
pem = "-----BEGIN RSA PRIVATE KEY-----\n" + pem_b64 + "-----END RSA PRIVATE KEY-----\n"

with open(r"C:\temp\Kontaktformular\id_rsa_deploy", 'w') as f:
    f.write(pem)

print("Key converted! n bits:", n.bit_length())
