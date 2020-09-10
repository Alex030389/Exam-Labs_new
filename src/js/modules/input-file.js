class InputFile {
  constructor(container) {
    this._container = container;
    this._input = this._container.querySelector(`input[type="file"]`);
    this._inputText = this._container.querySelector(`*[data-text]`);

    this._onInputChange = this._onInputChange.bind(this);
    this._init();
  }

  _onInputChange(evt) {
    evt.preventDefault();
    const fileName = evt.target.value.split(/(\\|\/)/g).pop();
    this._inputText.classList.add(`active`);
    this._inputText.title = fileName;
    this._inputText.textContent = fileName;
  }

  _init() {
    this._input.addEventListener(`change`, this._onInputChange);
  }
}
