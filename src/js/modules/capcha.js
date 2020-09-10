(() => {
  if (document.querySelector(`.form__capcha-button`)) {
    const buttons = Array.from(document.querySelectorAll(`.form__capcha-button`));
    buttons.forEach((button) => {
      button.addEventListener(`click`, (evt) => {
        evt.preventDefault();
        evt.target.classList.add(`form__capcha-button--refresh`);
        setTimeout(() => {
          evt.target.classList.remove(`form__capcha-button--refresh`);
        }, 300);
      })
    });
  }
})();
