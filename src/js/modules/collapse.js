'use strict';

// class Collapse {
//   constructor(options = {}) {
//     this._buttonElements = Array.from(document.querySelectorAll(`[data-collapse-button]`));
//     this._contentElements = Array.from(document.querySelectorAll(`[data-collapse-content]`));
//     this._limitSymbols = options.limitSymbols || 380;
//     this._hideText = options.hideText || `Hide`;
//     this._buttonsDefaultText = this._buttonElements.map((button) => button.textContent) || null;
//     this._contentsInner = this._contentElements.map((content) => content.innerHTML) || null;
//     this._contentsInitialHeight = this._contentElements.map((content) => content.offsetHeight) || null;
//     this._isHiddenText = false;

//     this._onButtonClick = this._onButtonClick.bind(this);
//   }

//   _onButtonClick(evt) {
//     evt.preventDefault();

//   }

//   init() {
//     if (this._buttonElements.length > 0) {
//       this._contentElements.forEach((content) => content.style.cssText = `transition: height 0.3s; overflow: hidden; height: ${this._contentsInitialHeight[0]}px`);
//       this._buttonElements.forEach((button) => button.addEventListener(`click`, this._onButtonClick))
//     }
//   }
// }

// new Collapse().init();

(() => {

  var initHidingBlock = function (block, button, limitSymbols) {
    var BUTTON_HIDE_TEXT = 'Hide'; // Текск кнопки, что бы спрятать текст
    var isHiddenText = false; // Флаг спрятан или показан текст
    var blockText;  // Полный текст блока
    var button; // Кнопка скрытия/показа текста
    var buttonText; // Первоначальный текст кнопки

    var hideText = function () { // Прячет текст
      var limitedText = block.innerHTML.substring(0, limitSymbols) + '...';
      block.innerHTML = limitedText;
      button.textContent = buttonText;
      isHiddenText = true;
      button.blur();
    };

    var showAllText = function () { // Показывает текст
      block.innerHTML = blockText;
      button.textContent = BUTTON_HIDE_TEXT;
      isHiddenText = false;
      button.blur();
    };

    var initButton = function () { // Инициализирует кнопку
      button.addEventListener('click', function (evt) {
        evt.preventDefault();
        if (isHiddenText) {
          showAllText();
        } else {
          hideText();
        }
      });
    };

    var initTextHiding = function () { // Инициализирует весь функционал
      buttonText = button.textContent;
      blockText = block.innerHTML;
      initButton();
      hideText();
    };

    initTextHiding();
  };

  // ============== Initialization ================

  // About Course
  if (document.querySelector('.collapse__content')) {
    initHidingBlock(document.querySelector('.collapse__content'), document.querySelector('.collapse__button'), 381);
  }
})();
