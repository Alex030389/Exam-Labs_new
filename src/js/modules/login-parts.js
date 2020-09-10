class Parts {
  constructor(options) {
    this._partsElements = Array.from(document.querySelectorAll(`.${options.partClass}`));
    this._buttonsElements = Array.from(document.querySelectorAll(`.${options.buttonClass}`));
    
    this._onButtonClick = this._onButtonClick.bind(this);
    this._init();
  }

  _onButtonClick(evt) {
    evt.preventDefault();
    const desiredPartNumber = evt.target.getAttribute(`data-part`);
    
    this._partsElements.forEach((part, index) => {
      if (index === desiredPartNumber - 1) {
        part.style.display = `block`;
      } else {
        part.style.display = `none`;
      }
    });
  }

  _init() {
    this._partsElements.forEach((part, index) => {
      if (index !== 0) {
        part.style.display = `none`;
      }
    });

    this._buttonsElements.forEach((button) => button.addEventListener(`click`, this._onButtonClick))
  }
}
