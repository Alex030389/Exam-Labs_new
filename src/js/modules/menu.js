class Menu {
  constructor(openButtonClass, closeButtonClass, menuClass) {
    this.openButtonClass = openButtonClass;
    this.closeButtonClass = closeButtonClass;
    this.menuClass = menuClass;
    this.openButtonElement = document.querySelector(`.${this.openButtonClass}`);
    this.closeButtonElement = document.querySelector(`.${this.closeButtonClass}`);
    this.menuElement = document.querySelector(`.${this.menuClass}`);
    this.init();
  }

  show() {
    document.body.style.overflow = `hidden`;
    this.menuElement.style.display = `block`;
    setTimeout(() => {
      this.menuElement.classList.add(`${this.menuClass}--shown`);
    }, 50);
  }

  hide() {
    document.body.style.overflow = ``;
    this.menuElement.classList.remove(`${this.menuClass}--shown`);
    setTimeout(() => {
      this.menuElement.style.display = `none`;
    }, 300);
  }

  init() {
    this.openButtonElement.addEventListener(`click`, (evt) => {
      evt.preventDefault();
      this.show();
    });

    this.closeButtonElement.addEventListener(`click`, (evt) => {
      evt.preventDefault();
      this.hide();
    });
  }
}
