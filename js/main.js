const slider = (function () {
  //const
  const slider = document.getElementById("slider"); // основная обертка
  const sliderContent = document.querySelector(".slider__content"); // обертка для контейнера слайдов и контролов
  const sliderWrapper = document.querySelector(".slider__content-wrapper"); // контейнер для слайдов
  const sliderMedia = document.querySelector(".slider__content-media"); // для медиа
  const elements = document.querySelectorAll(".slider__content-item"); // обертка для слайда
  const sliderContentControls = createHTMLElement(
    "div",
    "slider__content-controls"
  ); // блок контролов внутри sliderContent
  let dotsWrapper = null; // Обертка dots
  let prevButton = null; // Кнопки
  let nextButton = null;
  let autoButton = null;
  let leftArrow = null; // Стрелки
  let rightArrow = null;
  let intervalId = null; //идентификатор setInterval

  // data
  const itemsInfo = {
    offset: 0, // смещение контейнера со слайдами относительно начальной точки (первый слайд)
    position: {
      current: 0, // номер текущего слайда
      min: 0, // первый слайд
      max: elements.length - 1, // последний слайд
    },
    intervalSpeed: 2000, // Скорость смены слайдов в авторежиме

    update: function (value) {
      this.position.current = value;
      this.offset = -value;
    },
    reset: function () {
      this.position.current = 0;
      this.offset = 0;
    },
  };

  const controlsInfo = {
    buttonsEnabled: false,
    dotsEnabled: false,
    prevButtonDisabled: true,
    nextButtonDisabled: false,
  };

  // Инициализация слайдера
  function init(props) {
    // let {buttonsEnabled, dotsEnabled} = controlsInfo;
    let { intervalSpeed, position, offset } = itemsInfo;

    // Проверка наличия элементов разметки
    if (slider && sliderContent && sliderWrapper && elements && sliderMedia) {
      // Проверка входных параметров
      if (props && props.intervalSpeed) {
        intervalSpeed = props.intervalSpeed;
      }
      if (props && props.currentItem) {
        if (
          parseInt(props.currentItem) >= position.min &&
          parseInt(props.currentItem) <= position.max
        ) {
          position.current = props.currentItem;
          offset = -props.currentItem;
        }
      }
      if (props && props.buttons) {
        controlsInfo.buttonsEnabled = true;
      }
      if (props && props.dots) {
        controlsInfo.dotsEnabled = true;
      }

      _updateControlsInfo();
      _createControls(controlsInfo.dotsEnabled, controlsInfo.buttonsEnabled);
      _render();
    } else {
      console.log(
        "Проверьте наличие всех необходимых классов 'slider/slider-content/slider-wrapper/slider-content__item'"
      );
    }
  }

  // Обновить свойства контролов
  function _updateControlsInfo() {
    const { current, min, max } = itemsInfo.position;
    controlsInfo.prevButtonDisabled = current > min ? false : true;
    controlsInfo.nextButtonDisabled = current < max ? false : true;
  }

  // Создание элементов разметки
  function _createControls(dots = false, buttons = false) {
    //Обертка для контролов
    sliderContent.append(sliderContentControls);

    // Контролы
    createArrows();
    buttons ? createButtons() : null;
    dots ? createDots() : null;

    // Arrows function
    function createArrows() {
      const dValueLeftArrow =
        "M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z";
      const dValueRightArrow =
        "M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z";
      const leftArrowSVG = createSVG(dValueLeftArrow);
      const rightArrowSVG = createSVG(dValueRightArrow);

      leftArrow = createHTMLElement("div", "prev-arrow");
      leftArrow.append(leftArrowSVG);
      leftArrow.addEventListener("click", () =>
        updateItemsInfo(itemsInfo.position.current - 1)
      );

      rightArrow = createHTMLElement("div", "next-arrow");
      rightArrow.append(rightArrowSVG);
      rightArrow.addEventListener("click", () =>
        updateItemsInfo(itemsInfo.position.current + 1)
      );

      sliderContentControls.append(leftArrow, rightArrow);

      // SVG function
      function createSVG(dValue, color = "currentColor") {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttribute("viewBox", "0 0 256 512");
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        path.setAttribute("fill", color);
        path.setAttribute("d", dValue);
        svg.appendChild(path);
        return svg;
      }
    }

    // Dots function
    function createDots() {
      dotsWrapper = createHTMLElement("div", "dots");
      for (let i = 0; i < itemsInfo.position.max + 1; i++) {
        const dot = document.createElement("div");
        dot.className = "dot";
        dot.addEventListener("click", function () {
          updateItemsInfo(i);
        });
        dotsWrapper.append(dot);
      }
      sliderContentControls.append(dotsWrapper);
    }

    // Buttons function
    function createButtons() {
      const controlsWrapper = createHTMLElement("div", "slider__controls");
      prevButton = createHTMLElement("button", "prev-control", "Prev");
      prevButton.addEventListener("click", () =>
        updateItemsInfo(itemsInfo.position.current - 1)
      );

      autoButton = createHTMLElement("button", "auto-control", "Auto");
      autoButton.addEventListener("click", () => {
        intervalId = setInterval(function () {
          if (itemsInfo.position.current < itemsInfo.position.max) {
            itemsInfo.update(itemsInfo.position.current + 1);
          } else {
            itemsInfo.reset();
          }
          _slideItem();
        }, itemsInfo.intervalSpeed);
      });

      nextButton = createHTMLElement("button", "next-control", "Next");
      nextButton.addEventListener("click", () =>
        updateItemsInfo(itemsInfo.position.current + 1)
      );

      controlsWrapper.append(prevButton, autoButton, nextButton);
      slider.append(controlsWrapper);
    }
  }

  // Задать класс для контролов (buttons, arrows)
  function setClass(options) {
    if (options) {
      options.forEach(({ element, className, disabled }) => {
        if (element) {
          disabled
            ? element.classList.add(className)
            : element.classList.remove(className);
        } else {
          console.log("Error: function setClass(): element = ", element);
        }
      });
    }
  }

  // Обновить значения слайдера
  function updateItemsInfo(value) {
    itemsInfo.update(value);
    _slideItem(true);
  }

  // Отобразить элементы
  function _render() {
    const { prevButtonDisabled, nextButtonDisabled } = controlsInfo;
    let controlsArray = [
      { element: leftArrow, className: "d-none", disabled: prevButtonDisabled },
      {
        element: rightArrow,
        className: "d-none",
        disabled: nextButtonDisabled,
      },
    ];
    if (controlsInfo.buttonsEnabled) {
      controlsArray = [
        ...controlsArray,
        {
          element: prevButton,
          className: "disabled",
          disabled: prevButtonDisabled,
        },
        {
          element: nextButton,
          className: "disabled",
          disabled: nextButtonDisabled,
        },
      ];
    }

    // Отображаем/скрываем контроллы
    setClass(controlsArray);

    // Передвигаем слайдер
    sliderWrapper.style.transform = `translateX(${itemsInfo.offset * 100}%)`;
    sliderMedia.style.transform = `translateX(${itemsInfo.offset * 100}%)`;

    // Задаем активный элемент для точек (dot)
    if (controlsInfo.dotsEnabled) {
      if (document.querySelector(".dot--active")) {
        document.querySelector(".dot--active").classList.remove("dot--active");
      }
      dotsWrapper.children[itemsInfo.position.current].classList.add(
        "dot--active"
      );
    }
  }

  // Переместить слайд
  function _slideItem(autoMode = false) {
    if (autoMode && intervalId) {
      clearInterval(intervalId);
    }
    _updateControlsInfo();
    _render();
  }

  // Создать HTML разметку для элемента
  function createHTMLElement(tagName = "div", className, innerHTML) {
    const element = document.createElement(tagName);
    className ? (element.className = className) : null;
    innerHTML ? (element.innerHTML = innerHTML) : null;
    return element;
  }

  // Доступные методы
  return { init };
})();

slider.init({
  // intervalSpeed: 1000,
  currentItem: 0,
  buttons: true,
  dots: true,
});

// --- закрытие под меню  ---//

let isClosed = true;

$(document).ready(function () {
  $(".help__burger").on("click", function () {
    if (isClosed) {
      $(".drop__menu-burger").show();
      $(".help__burger").removeClass("drop__arrow-close");
      $(".help__burger").addClass("drop__arrow-open");
      $(".nav__burger-wrap").css({
        height: "519px",
      });
      isClosed = false;
    } else {
      $(".drop__menu-burger").hide();
      $(".help__burger").removeClass("drop__arrow-open");
      $(".help__burger").addClass("drop__arrow-close");
      $(".nav__burger-wrap").css({
        height: "355px",
      });
      isClosed = true;
    }
  });
});

// --- закрытие бургер меню ---//


let burger = true;

$(document).ready(function () {
  $(".burger").on("click", function () {
    if (burger) {
      $(".nav__burger-wrap").show();
      $(".burger").removeClass("burger__statick");
      $(".burger").addClass("burger__click");
      burger = false;
    } else {
      $(".nav__burger-wrap").hide();
      $(".burger").addClass("burger__statick");
      $(".burger").removeClass("burger__click");
      burger = true;
    }
  });
});



$(document).ready(function () {
  $(".popup__btn").on("click", function () {
    $(".overlay").show(200);
  });
  $(".popup-close").on("click", function () {
    $(".overlay").hide(200);
  });
});

//  первая карточка  //

let linkOne = true;

$(document).ready(function () {
  $(".learn__more-one").on("click", function () {
    if (linkOne) {
      $(".toggle__img-one").removeClass("one"); // меняем цифру на картинку
      $(".toggle__img-one").addClass("img__down"); // меняем цифру на картинку
      $(".transform__one").addClass("padding__drop");
      $(".img__down").show();
      $(".transform__one").css({
        "padding-left": "70px",
      });
      $(".slider__content-wrapper").css({
        left: "80px",
      });

      $(".text__h2-one").text("Search Data");
      $(".text__paragrath-one").text(
        "Each time she picked one she thought that she could see an even more beautiful one a little way off, and she ran after it, going further and further into the woods."
      );
      linkOne = false;
    } else {
      $(".toggle__img-one").removeClass("img__down"); // меняем цифру на картинку
      $(".toggle__img-one").addClass("one"); // меняем цифру на картинку
      $(".transform__one").removeClass("padding__drop");
      $(".img__down").hide();
      $(".transform__one").css({
        "padding-left": "0px",
      });
      $(".slider__content-wrapper").css({
        left: "150px",
      });
      $(".text__h2-one").text("First Feature");
      $(".text__paragrath-one").text(
        "SDon’t worry if your data is very large, the Data Warehoue provides a search engine, which is useful for making it easier to find data effectively saving time."
      );
      linkOne = true;
    }
  });
});

//   вторая карточка  //

let linkTwo = true;

$(document).ready(function () {
  $(".learn__more-two").on("click", function () {
    if (linkTwo) {
      $(".toggle__img-two").removeClass("two"); // меняем цифру на картинку
      $(".toggle__img-two").addClass("img__up"); // меняем цифру на картинку
      $(".img__up").show();
      $(".card").css({
        "margin-right": "80px",
      });
      $(".transform__two").css({
        "padding-left": "70px",
      });
      $(".text__h2-two").text("Search Data");
      $(".text__paragrath-two").text(
        "Each time she picked one she thought that she could see an even more beautiful one a little way off, and she ran after it, going further and further into the woods."
      );
      linkTwo = false;
    } else {
      $(".toggle__img-two").removeClass("img__up"); // меняем цифру на картинку
      $(".toggle__img-two").addClass("two"); // меняем цифру на картинку
      $(".img__up").hide();
      $(".card").css({
        "margin-right": "150px",
      });
      $(".transform__two").css({
        "padding-left": "0px",
      });
      $(".text__h2-two").text("Second Feature");
      $(".text__paragrath-two").text(
        "SDon’t worry if your data is very large, the Data Warehoue provides a search engine, which is useful for making it easier to find data effectively saving time."
      );
      linkTwo = true;
    }
  });
});

//   третья карточка  //

let linkThree = true;

$(document).ready(function () {
  $(".learn__more-three").on("click", function () {
    if (linkThree) {
      $(".toggle__img-three").removeClass("three"); // меняем цифру на картинку
      $(".toggle__img-three").addClass("img__down"); // меняем цифру на картинку
      $(".img__down").show();
      $(".transform__three").css({
        "padding-left": "70px",
      });
      $(".slider__content-wrapper").css({
        left: "80px",
      });

      $(".text__h2-three").text("Search Data");
      $(".text__paragrath-three").text(
        "Each time she picked one she thought that she could see an even more beautiful one a little way off, and she ran after it, going further and further into the woods."
      );
      linkThree = false;
    } else {
      $(".toggle__img-three").removeClass("img__down"); // меняем цифру на картинку
      $(".toggle__img-three").addClass("three"); // меняем цифру на картинку
      $(".img__down").hide();
      $(".transform__three").css({
        "padding-left": "0px",
      });
      $(".slider__content-wrapper").css({
        left: "150px",
      });
      $(".text__h2-three").text("First Feature");
      $(".text__paragrath-three").text(
        "SDon’t worry if your data is very large, the Data Warehoue provides a search engine, which is useful for making it easier to find data effectively saving time."
      );
      linkThree = true;
    }
  });
});

//   четвертая карточка  //

let linkFore = true;

$(document).ready(function () {
  $(".learn__more-fore").on("click", function () {
    if (linkFore) {
      $(".toggle__img-fore").removeClass("fore"); // меняем цифру на картинку
      $(".toggle__img-fore").addClass("img__up"); // меняем цифру на картинку
      $(".img__up").show();
      $(".card").css({
        "margin-right": "80px",
      });
      $(".transform__fore").css({
        "padding-left": "70px",
      });
      $(".new").css({
        // new
        left: "185px",
      });
      $(".text__h2-fore").text("Search Data");
      $(".text__paragrath-fore").text(
        "Each time she picked one she thought that she could see an even more beautiful one a little way off, and she ran after it, going further and further into the woods."
      );
      linkFore = false;
    } else {
      $(".toggle__img-fore").removeClass("img__up"); // меняем цифру на картинку
      $(".toggle__img-fore").addClass("fore"); // меняем цифру на картинку
      $(".img__up").hide();
      $(".card").css({
        "margin-right": "150px",
      });
      $(".transform__fore").css({
        "padding-left": "0px",
      });
      $(".new").css({
        // new
        left: "115px",
      });
      $(".text__h2-fore").text("Second Feature");
      $(".text__paragrath-fore").text(
        "SDon’t worry if your data is very large, the Data Warehoue provides a search engine, which is useful for making it easier to find data effectively saving time."
      );
      linkFore = true;
    }
  });
});

$(window).resize(function () {
  const windowWidth = $(window).width();

  if (windowWidth > 1200) {
    $(".nav__burger-wrap").hide();
    $(".burger").removeClass("burger__click");
    $(".burger").addClass("burger__statick");
    burger = true;
  }
});
