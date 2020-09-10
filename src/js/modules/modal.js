class Modal {
  constructor(modalClass, props = {}) {
    this._modalClass = modalClass;
    this._activeClassEnding = props.activeClassEnding || `--shown`;
    this._callButtonClass = props.callButtonClass || null;
    this._overlayClass = props.overlayClass || `overlay`;
    this._closeButtonClasses = props.closeButtonClasses || [`modal__close`, `modal__close-bottom`];
    this.onOpen = props.onOpen || null;
    this.onClose = props.onClose || null;

    this._bodyElement = document.body;
    this._callButtonsElements = this._callButtonClass ? Array.from(document.querySelectorAll(`.${this._callButtonClass}`)) : null;
    this._modalElement = document.querySelector(`.${this._modalClass}`);
    this._overlayElement = this._modalElement.closest(`.${this._overlayClass}`);
    this._closeButtonElements = this._closeButtonClasses
      .map((buttonClass) => this._modalElement.querySelector(`.${buttonClass}`))
      .filter((item) => item !== null);
      
    this._onCloseButtonClick = this._onCloseButtonClick.bind(this);
    this._onCallButtonClick = this._onCallButtonClick.bind(this);
    this._onOverlayMousedown = this._onOverlayMousedown.bind(this);
    this._onEsqKeydown = this._onEsqKeydown.bind(this);
    this._onWindowFullscreenChange = this._onWindowFullscreenChange.bind(this);

    this._init();
  }

  _addFullscreenChangeListener() {
    if (document.body.requestFullscreen) {
      window.addEventListener(`fullscreenchange`, this._onWindowFullscreenChange);
    } else if (document.body.webkitRequestFullscreen) {
      window.addEventListener(`webkitfullscreenchange`, this._onWindowFullscreenChange);
    } else if (document.body.msRequestFullscreen) {
      window.addEventListener(`MSFullscreenChange`, this._onWindowFullscreenChange);
    }
  }

  _blockBody() {
    this._bodyElement.style.overflow = `hidden`;
  }

  _onCallButtonClick(evt) {
    evt.preventDefault();
    this.show();
  }

  _onCloseButtonClick(evt) {
    evt.preventDefault();
    this.close();
  }

  _onEsqKeydown(evt) {
    if(evt.key === `Escape` || evt.key === `Esc`) {
      evt.preventDefault();
      
      this.close();
    }
  }

  _onOverlayMousedown(evt) {
    if (evt.target.classList.contains(this._overlayClass)) {
      this.close();
    }
  }

  _onWindowFullscreenChange() {
    if (document.fullscreenElement || document.msFullscreenElement) {
      window.removeEventListener(`keydown`, this._onEsqKeydown);
    } else {
      window.addEventListener(`keydown`, this._onEsqKeydown);
    }
  }

  _unblockBody() {
    this._bodyElement.style.overflow = ``;
  }

  _init() {
    if (this._callButtonsElements) {
      this._callButtonsElements.forEach((button) => {
        button.addEventListener(`click`, this._onCallButtonClick);
      });
    }
  }

  _removeFullscreenChangeListener() {
    if (document.body.requestFullscreen) {
      window.removeEventListener(`fullscreenchange`, this._onWindowFullscreenChange);
    } else if (document.body.webkitRequestFullscreen) {
      window.removeEventListener(`webkitfullscreenchange`, this._onWindowFullscreenChange);
    } else if (document.body.msRequestFullscreen) {
      window.removeEventListener(`MSFullscreenChange`, this._onWindowFullscreenChange);
    }
  }

  show() {
    this._blockBody();
    this._overlayElement.style.display = 'flex';
    this._modalElement.style.display = 'block';
    this._closeButtonElements.forEach((button) => button.addEventListener(`click`, this._onCloseButtonClick));
    this._overlayElement.addEventListener(`mousedown`, this._onOverlayMousedown);
    window.addEventListener(`keydown`, this._onEsqKeydown);
    this._addFullscreenChangeListener();
    this.onOpen && this.onOpen();

    setTimeout(() => {
      this._overlayElement.classList.add(`${this._overlayClass + this._activeClassEnding}`);
      this._modalElement.classList.add(`modal${this._activeClassEnding}`);
    }, 50);
  }

  close() {
    this._unblockBody();
    this._overlayElement.classList.remove(`${this._overlayClass + this._activeClassEnding}`);
    this._modalElement.classList.remove(`modal${this._activeClassEnding}`);
    this._closeButtonElements.forEach((button) => button.removeEventListener(`click`, this._onCloseButtonClick));
    this._overlayElement.removeEventListener(`mousedown`, this._onOverlayMousedown);
    window.removeEventListener(`keydown`, this._onEsqKeydown);
    this._removeFullscreenChangeListener();
    this.onClose && this.onClose();

    setTimeout(() => {
      this._overlayElement.style.display = '';
      this._modalElement.style.display = '';
    }, 300);
  }
}
