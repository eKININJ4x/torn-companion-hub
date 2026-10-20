document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('tcCopyOcRequirements');
  const status = document.getElementById('tcOcRequirementsCopyStatus');
  const box = document.getElementById('tcOcRequirementsScriptText');
  if (!button || !status || !box) return;

  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Loading OC Requirement Display…';
    try {
      const response = await fetch('/scripts/tc-oc-requirements.user.js', { cache: 'no-cache' });
      if (!response.ok) throw new Error('Unable to load the script. Try the install link above.');
      const script = await response.text();
      if (!script.startsWith('// ==UserScript==') || !script.includes('// ==/UserScript==')) {
        throw new Error('The installer was not returned. Try the install link above.');
      }
      try {
        await navigator.clipboard.writeText(script);
        box.hidden = true;
        status.textContent = 'Script copied. Paste it into your userscript editor, save and reload Torn.';
      } catch {
        box.hidden = false;
        box.value = script;
        box.focus();
        box.select();
        status.textContent = 'Select and copy the complete script below, then paste it into your userscript editor.';
      }
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
});
