param([string]$cmd)
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'C:\Program Files\PuTTY\plink.exe'
$psi.Arguments = "-i `"C:\temp\Kontaktformular\formular_seg_private.ppk`" -batch root@46.225.170.106 `"$cmd`""
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$p = [System.Diagnostics.Process]::Start($psi)
$out = $p.StandardOutput.ReadToEnd()
$err = $p.StandardError.ReadToEnd()
$p.WaitForExit(15000) | Out-Null
if (!$p.HasExited) { $p.Kill() }
Write-Output $out
if ($err) { Write-Error $err }
