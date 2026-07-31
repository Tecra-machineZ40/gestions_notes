(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const ueSelect = document.querySelector('#id_ue');
    const codeInput = document.querySelector('#id_code_matiere');

    if (!ueSelect || !codeInput) return;

    const setCodeFromUE = () => {
      const selectedOption = ueSelect.options[ueSelect.selectedIndex];
      if (!selectedOption) return;

      const ueText = selectedOption.textContent || selectedOption.innerText;
      const codeMatch = ueText.match(/^(.*?)\s*-\s*/);
      if (codeMatch && codeMatch[1]) {
        if (!codeInput.value || codeInput.value === '') {
          codeInput.value = codeMatch[1].trim();
        }
      }
    };

    ueSelect.addEventListener('change', setCodeFromUE);
    setCodeFromUE();
  });
})();