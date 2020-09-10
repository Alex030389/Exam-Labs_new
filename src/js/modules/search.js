class Search {
  constructor(buttonClass, searchClass) {
    this._buttonClass = buttonClass;
    this._searchClass = searchClass;
    this._buttonElement = document.querySelector(`.${this._buttonClass}`);
    this._searchElement = document.querySelector(`.${this._searchClass}`);
    this._isonlyFocus = this._searchElement.classList.contains(`search-js--only-focus`);
    this._isSearchShown = false;
    this._init();
  }

  _focus() {
    this._searchElement.querySelector(`input[type="search"]`).focus();
  }

  _showSearch() {
    this._searchElement.classList.add(`${this._searchClass}--shown`);
    this._focus();
    this._isSearchShown = true;
  }

  _hideSearch() {
    this._searchElement.classList.remove(`${this._searchClass}--shown`);
    this._isSearchShown = false;
  }

  _init() {
    if (this._isOnlyFocus) {
      this._buttonElement.addEventListener(`click`, (evt) => {
        evt.preventDefault();
        this._focus();
      });
    } else {
      this._buttonElement.addEventListener(`click`, (evt) => {
        evt.preventDefault();
        this._isSearchShown ?
          this._hideSearch() :
          this._showSearch();
      });
    }
  }
}