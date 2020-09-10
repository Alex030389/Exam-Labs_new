/////////////////////// SLIDERS

// Slider with vendor links on the home page
if (document.querySelector(`.header-links__swiper-slider`)) {
  new Swiper(`.header-links__swiper-slider`, {
    slidesPerView: `auto`,
    watchOverflow: true,
  });
}

// Slider with top vendors on the home page
if (document.querySelector(`.hot__list-wrapper`)) {
  new Swiper(`.hot__list-wrapper`, {
    slidesPerView: `auto`,
    watchOverflow: true,
    navigation: {
      prevEl: `.hot__slider-button.button--slider--prev`,
      nextEl: `.hot__slider-button.button--slider--next`,
    },
  });
}

// Slider with hot training courses in sidebar (responsive)
if (document.querySelector(`.hot-sidebar__list-wrapper`)) {
  const sliderWrappers = Array.from(document.querySelectorAll(`.hot-sidebar__list-wrapper`));

  const initHotSliders = (sliderWrapperElement) => {
    let hotSidebarSlider = null;
  
    const createHotSidebarSlider = () => {
      hotSidebarSlider = new Swiper(sliderWrapperElement, {
        slidesPerView: `auto`,
        watchOverflow: true,
        navigation: {
          prevEl: sliderWrapperElement.querySelector(`.button--slider--prev`),
          nextEl: sliderWrapperElement.querySelector(`.button--slider--next`),
        },
      });
    };
    
    if (innerWidth < 1200) {
      createHotSidebarSlider();
    }
    
    window.addEventListener(`resize`, () => {
      if (innerWidth > 1200 && hotSidebarSlider !== null) {
        hotSidebarSlider.destroy();
        hotSidebarSlider = null;
      } else if (innerWidth <= 1200 && hotSidebarSlider === null) {
        createHotSidebarSlider();
      }
    });
  }

  sliderWrappers.forEach((sliderWrapper) => initHotSliders(sliderWrapper));
}

// Slider with hot training courses in main content of page 
if (document.querySelector(`.hot-sidebar__list-wrapper--full-page`)) {
  new Swiper(`.hot-sidebar__list-wrapper--full-page`, {
    slidesPerView: `auto`,
    watchOverflow: true,
    navigation: {
      prevEl: `.hot-sidebar__slider-button.button--slider--prev`,
      nextEl: `.hot-sidebar__slider-button.button--slider--next`,
    }
  });
}

// Sliders of courses
if (document.querySelector(`.courses__list-wrapper`)) {
  const containers = Array.from(document.querySelectorAll(`.courses__list-wrapper`));

  containers.forEach((container) => new Swiper(container, {
    slidesPerView: `auto`,
    watchOverflow: true,
    navigation: {
      prevEl: container.querySelector(`.button--slider--prev`),
      nextEl: container.querySelector(`.button--slider--next`),
    },
  }));
}

// Screenshots Slider
if (document.querySelector(`.screenshots__slider--half-width`)) {
  new Swiper(`.screenshots__slider--half-width`, {
    slidesPerView: `auto`,
    watchOverflow: true,
    centeredSlides: true,
    navigation: {
      prevEl: `.screenshots__slider-button.button--slider--prev`,
      nextEl: `.screenshots__slider-button.button--slider--next`,
    },
  });
}

// Screenshots Slider (full width)
if (document.querySelector(`.screenshots__slider--full-width`)) {
  new Swiper(`.screenshots__slider--full-width`, {
    slidesPerView: `auto`,
    watchOverflow: true,
    centeredSlides: true,
    loop: true,
    navigation: {
      prevEl: `.screenshots__slider-button.button--slider--prev`,
      nextEl: `.screenshots__slider-button.button--slider--next`,
    },
  });
}

// Slider in the videocourse page
if (document.querySelector(`.course__list-container`)) {
  new Swiper(`.course__list-container`, {
    slidesPerView: `auto`,
    watchOverflow: true,
    navigation: {
      prevEl: `.course__slider-button.button--slider--prev`,
      nextEl: `.course__slider-button.button--slider--next`,
    },
  });
}

//////////////////////// MOBILE MENU
if (document.querySelector(`.menu-button-open-js`)) {
  const mobileMenu = new Menu(`menu-button-open-js`, `menu-button-close-js`, `main-menu-js`); 
}

//////////////////////// MOBILE SEARCH
if (document.querySelector(`.search-button-js`)) {
  new Search(`search-button-js`, `search-js`); 
}

//////////////////////// MODALS

// Discount
if (document.querySelector(`.modal--discount`)) {
  const modalDiscount = new Modal(`modal--discount`); 
}

// Discount
if (document.querySelector(`.modal--steps`)) {
  const modalHowItWorks = new Modal(`modal--steps`, {
    callButtonClass: `js-button-how-it-works`
  }); 
}

// Free Demo
if (document.querySelector(`.modal--free-demo`)) {
  const modalFreeDemo = new Modal(`modal--free-demo`, {
    callButtonClass: `js-free-demo-button`
  }); 
}

// Not Convinced
if (document.querySelector(`.product__link-modal`)) {
  const modalFreeDemo = new Modal(`modal--not-convinced`, {
    callButtonClass: `product__link-modal`
  }); 
}

// Products (on the certification page)
if (document.querySelector(`.js-products`)) {
  const modalFreeDemo = new Modal(`modal--products`, {
    callButtonClass: `js-products`
  }); 
}

// Login (on the videocourse page)
if (document.querySelector(`.js-modal-login`)) {
  const modalLogin = new Modal(`modal--login`, {
    callButtonClass: `js-modal-login`
  }); 
}

//////////////////////// EXPAND
if (document.querySelector(`.expand`)) {
  $('.expand [data-accordion]').accordion();
}

//////////////////////// PARTS
if (document.querySelector(`.login__part`)) {
  new Parts({
    partClass: `login__part`,
    buttonClass: `login__button--part`
  });
}

/////////////////////// SELECTS

$(function() {
  $('select').selectric();
});

/////////////////////// INPUTS [type="fyle"]

if (document.querySelector(`.form__field-wrapper--file`)) {
  const inputs = Array.from(document.querySelectorAll(`.form__field-wrapper--file`));
  inputs.forEach((input) => new InputFile(input));
}
