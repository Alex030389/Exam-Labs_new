'use strict';

(() => {
  const buttonElement = document.querySelector('.button-up'); // Кнопка скролла в начало страницы

  window.utils = {
    scrollTop: () => { // Функция прокручивает страницу в начало
      const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
      const delay = isIE11 ? 500 : 0;
      
      $(`html, body`).animate({scrollTop: 0}, delay);
      return false;
    }
  };

  if (buttonElement) {
    const onPageScroll = () => { // Добавляет/удаляет класс кнопки      
      if(document.documentElement.scrollTop >= innerHeight * 0.6) {
        buttonElement.classList.add(`button-up--visible`);
      } else {
        buttonElement.classList.remove(`button-up--visible`);
      }
    };
    
    buttonElement.addEventListener(`click`, window.utils.scrollTop);
    document.addEventListener(`scroll`, onPageScroll);
  }
})();
