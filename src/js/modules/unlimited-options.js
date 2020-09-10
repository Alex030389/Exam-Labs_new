(() => {  
  if (document.querySelector(`.js-unlimited-option`)) {
    const options = Array.from(document.querySelectorAll(`.js-unlimited-option`));
    const total = document.querySelector(`.options__total-price`);

    options.forEach((option) => option.addEventListener(`click`, (evt) => {
      total.textContent = evt.target.getAttribute(`data-value`);
    }));

    total.textContent = options.find((option) => option.checked).getAttribute(`data-value`);
  }
})();