"""Mirror newer canonical TC OC releases into the hub's PDA installer."""
from pathlib import Path
import re
import subprocess
import tempfile

URL = 'https://raw.githubusercontent.com/eKININJ4x/torn-oc-utility-manager/main/oc-utility-manager.user.js'
TARGET = Path(__file__).resolve().parents[1] / 'public/scripts/tc-oc.user.js'


def version(source):
    header = re.search(r'^// ==UserScript==\s*\n(.*?)^// ==/UserScript==', source, re.M | re.S)
    if not header:
        raise ValueError('Missing userscript header')
    match = re.search(r'^//\s*@version\s+(\d+\.\d+\.\d+)\s*$', header.group(1), re.M)
    if not match or not re.search(r'^//\s*@match\s+https://www\.torn\.com/factions\.php\*\s*$', header.group(1), re.M):
        raise ValueError('Invalid TC OC version or faction match')
    return tuple(map(int, match.group(1).split('.')))


def sync(source):
    incoming = version(source)
    current = version(TARGET.read_text())
    if incoming < current:
        raise ValueError('Refusing a TC OC version downgrade')
    if incoming == current:
        print('TC OC is already up to date: ' + '.'.join(map(str, current)))
        return False
    with tempfile.TemporaryDirectory() as folder:
        candidate = Path(folder) / 'candidate.js'
        candidate.write_text(source)
        subprocess.run(['node', '--check', str(candidate)], check=True)
    TARGET.write_text(source)
    print('Updated TC OC to ' + '.'.join(map(str, incoming)))
    return True


if __name__ == '__main__':
    fetched = subprocess.check_output(['curl', '--fail', '--silent', '--show-error', '--location', '--max-time', '60', URL]).decode('utf-8')
    sync(fetched)
