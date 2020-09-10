`use strict`;

(() => {
  const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

  const stickFooter = () => {
    document.querySelector(`.ie-width`).textContent = `${innerWidth}px`;
    const FOOTER = document.querySelector(`.page-footer`);
    const MAIN = document.querySelector(`.page-main`);
    const BODY = document.querySelector(`body`);
    const footerHeight = FOOTER.offsetHeight;

    BODY.style.position = `relative`;
    MAIN.style.marginBottom = `${footerHeight}px`;
    FOOTER.style.position = `absolute`;
    FOOTER.style.bottom = `0`;
    FOOTER.style.left = `0`;
    FOOTER.style.width = `100%`;
  };

  if (isIE11) {
    const widthLabel = document.createElement(`div`);
    widthLabel.style.position = 'fixed';
    widthLabel.style.top = '0';
    widthLabel.style.left ='0';
    widthLabel.style.padding = '10px 20px';
    widthLabel.style.color = 'white';
    widthLabel.style.fontSize = '20px',
    widthLabel.style.fontWeight = '500';
    widthLabel.style.border = '2px solid rgba(0, 255, 155, 1)';
    widthLabel.style.backgroundColor = 'rgba(0, 255, 155, 0.7)';
    widthLabel.style.zIndex = '15';

    widthLabel.classList.add(`ie-width`);
    widthLabel.textContent = `${innerWidth}px`;
    document.body.appendChild(widthLabel);

    stickFooter();
    window.addEventListener(`resize`, stickFooter);
  }
})();
