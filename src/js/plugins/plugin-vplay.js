const VolumeClasses = {
  level1: `vplay__volume--level-1`,
  level2: `vplay__volume--level-2`,
  level3: `vplay__volume--level-3`,
  level4: `vplay__volume--level-4`,
};

const formatTime = (timeValue) => {  
  let hours = Math.floor(timeValue / 60 / 60);
  let minutes = Math.floor(timeValue / 60 % 60);
  let seconds = Math.floor(timeValue % 60);

  hours = hours <= 0 ? `` : hours;
  minutes = !minutes && minutes !== 0 ? `-` : minutes < 0 ? 0: minutes;
  seconds = !seconds && seconds !== 0 ? `-` : seconds < 0 ? `00` : seconds < 10 ? `0${seconds}` : seconds;

  const totalTime = hours ? `${hours}:` : `` + `${minutes}:${seconds}`;

  return totalTime;
};

const timeToPercent = (currenTime, fullTime) => currenTime / fullTime * 100;

class DragNDrop {
  constructor(container, element, options = {}) {
    this._container = container;
    this._element = element;
    this._onChange = options.onChange || null;
    this._onTotalChange = options.onTotalChange || null;
    this._containerCoords = null;
    this._value = null;

    this._onContainerMousedown = this._onContainerMousedown.bind(this);
    this._onWindowMousemove = this._onWindowMousemove.bind(this);
    this._onWindowMouseup = this._onWindowMouseup.bind(this);
    this._onContainerTouchstart = this._onContainerTouchstart.bind(this);
    this._onWindowTouchmove = this._onWindowTouchmove.bind(this);
    this._onWindowTouchend = this._onWindowTouchend.bind(this);

    this._init();
  }

  get value() {
    return this._value;
  }

  changeValue(value) {
    this._value = value;
    this._element.style.width = `${this._value}%`;
  }

  _changeCoords(cursorX) {
    if (cursorX >= this._containerCoords.left && cursorX <= this._containerCoords.right) {
      const cursorXFromContainerLeft =
        cursorX - this._containerCoords.left < 1 ?
        0 :
        Math.ceil(cursorX - this._containerCoords.left);

      let widthValue = cursorXFromContainerLeft / this._containerCoords.width * 100;
      this.changeValue(widthValue);

      if (this._onChange) {
        this._onChange(this._value);
      }
    }
  }

  _onWindowMouseup() {
    this._container.classList.remove(`vplay__active`);
    window.removeEventListener(`mousemove`, this._onWindowMousemove);
    window.removeEventListener(`mouseup`, this._onWindowMouseup);
    this._containerCoords = null;
    if (this._onTotalChange) {
      this._onTotalChange(this._value);
    }
  }

  _onWindowMousemove(evt) {
    this._changeCoords(evt.clientX);
  }

  _onWindowTouchend() {
    this._container.classList.remove(`vplay__active`);
    window.removeEventListener(`touchmove`, this._onWindowTouchmove);
    window.removeEventListener(`touchend`, this._onWindowTouchend);
    this._containerCoords = null;
    if (this._onTotalChange) {
      this._onTotalChange(this._value);
    }
  }

  _onWindowTouchmove(evt) {
    this._changeCoords(evt.changedTouches[0].clientX);
  }

  _onContainerMousedown(evt) {
    if (evt.which === 1) {
      this._containerCoords = this._container.getBoundingClientRect();
      
      this._container.classList.add(`vplay__active`);
      window.addEventListener(`mouseup`, this._onWindowMouseup);
      window.addEventListener(`mousemove`, this._onWindowMousemove);
      this._changeCoords(evt.clientX);
    }
  }

  _onContainerTouchstart(evt) {
    this._containerCoords = this._container.getBoundingClientRect();
    
    this._container.classList.add(`vplay__active`);
    window.addEventListener(`touchend`, this._onWindowTouchend, { passive: true });
    window.addEventListener(`touchmove`, this._onWindowTouchmove, { passive: true });
    this._changeCoords(evt.changedTouches[0].clientX);
  }

  _init() {
    this._container.addEventListener(`mousedown`, this._onContainerMousedown, { passive: true });
    this._container.addEventListener(`touchstart`, this._onContainerTouchstart, { passive: true });
  }
}

class Vplay {
  constructor(video, options) {
    this._videoElement = typeof video === `string` ? document.querySelector(video) : video;
    this._playlist = options.playlist || null;    
    this._dafaultVolume = options.dafaultVolume || 75;
    this._speeds = options.speeds || ``;
    this._loop = options.loop || false;
    this._currentSpeed = 1;
    this._userSleepDelay = 3;
    this._userSleepSeconds = 0;

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this._changeVolume = this._changeVolume.bind(this);
    this._onPlayPauseClick = this._onPlayPauseClick.bind(this);
    this._onVideoLoadMeta = this._onVideoLoadMeta.bind(this);
    this._onVideoEnd = this._onVideoEnd.bind(this);
    this._onVideoTimeupdate = this._onVideoTimeupdate.bind(this);
    this._updateCurrentTime = this._updateCurrentTime.bind(this);
    this._onVideoSeeking = this._onVideoSeeking.bind(this);
    this._onVideoSeeked = this._onVideoSeeked.bind(this);
    this._pauseOnVideoTimeupdate = this._pauseOnVideoTimeupdate.bind(this);
    this._onVideoProgress = this._onVideoProgress.bind(this);
    this._onFullscreenClick = this._onFullscreenClick.bind(this);
    this._onContainerFullscreenchange = this._onContainerFullscreenchange.bind(this);
    this._onProgressBarMousemove = this._onProgressBarMousemove.bind(this);
    this._onPlaylistButtonClick = this._onPlaylistButtonClick.bind(this);
    this._onNextButtonClick = this._onNextButtonClick.bind(this);
    this._onPreviousButtonClick = this._onPreviousButtonClick.bind(this);
    this._onProgressBarTouchmove = this._onProgressBarTouchmove.bind(this);

    this.init();
  }

  init() {
    this._videoElement.addEventListener(`loadedmetadata`, this._onVideoLoadMeta);
    this._wrapVideoElement();
    this._playlist && this._initPlaylist();
    this._createControlsBar();
    this._initVolume();
    this._startTarackingUserActivity();
    this._videoElement.addEventListener(`ended`, this._onVideoEnd);
    this._videoElement.addEventListener(`timeupdate`, this._onVideoTimeupdate);
    this._videoElement.addEventListener(`progress`, this._onVideoProgress);
    this._videoElement.addEventListener(`seeking`, this._onVideoSeeking);
    this._videoElement.addEventListener(`seeked`, this._onVideoSeeked);
    this._addFullscreenChangeListener();
    this._videoElement.autoplay && this.play();
  }

  mute() {
    this._changeVolume(0);
    this._rememberVolume(0);
    this._volumeSlider.changeValue(0);
    this._volumeButton.title = `Unmute`;
    this._volumeButton.querySelector(`span`).textContent = `Unmute`;
  }

  pause() {
    this._playPauseButton.title = `Play`;
    this._playPauseButton.querySelector(`span`).textContent = `Play`;
    this._bigPlayPauseButton.title = `Play Video`;
    this._bigPlayPauseButton.querySelector(`span`).textContent = `Play Video`;
    this._container.classList.remove(`vplay--played`);
    this._container.classList.add(`vplay--paused`);
    this._videoElement.pause();
    if (this._playlist && this._playlistItems) {
      this._playlistItems[this._currentPlaylistItemNumber].classList.remove(`${this._playlistItemClass}--playing`);
    }
  }

  play() {
    this._playPauseButton.title = `Pause`;
    this._playPauseButton.querySelector(`span`).textContent = `Pause`;
    this._bigPlayPauseButton.title = `Pause Video`;
    this._bigPlayPauseButton.querySelector(`span`).textContent = `Pause Video`;
    this._container.classList.remove(`vplay--paused`);
    this._container.classList.remove(`vplay--ended`);
    this._container.classList.add(`vplay--played`);
    this._videoElement.play();
    if (this._playlistItems) {
      this._playlistItems[this._currentPlaylistItemNumber].classList.add(`${this._playlistItemClass}--playing`);
    }

    if (this._playlist && this._playlistNavigation) {
      this._previousButton.disabled = this._currentPlaylistItemNumber ? false : true;
      this._nextButton.disabled =
        !this._playlist.loop && this._currentPlaylistItemNumber === this._playlistSources.length - 1 ?
        true : false;
    }
  }

  playNext() {
    if (this._playlistItems) {
      this._playlistItems[this._currentPlaylistItemNumber].classList.remove(`${this._playlistItemClass}--current`);
      this._playlistItems[this._currentPlaylistItemNumber].classList.remove(`${this._playlistItemClass}--playing`)
    }

    if (this._currentPlaylistItemNumber !== this._playlistSources.length - 1) {
      if (this._playlistItems) {
        this._playlistItems[this._currentPlaylistItemNumber + 1].classList.add(`${this._playlistItemClass}--current`);
      }

      this._videoElement.src = this._playlistSources[++this._currentPlaylistItemNumber];
    } else {
      if (this._playlistItems) {
        this._playlistItems[0].classList.add(`${this._playlistItemClass}--current`);
      }

      this._currentPlaylistItemNumber = 0;
      this._videoElement.src = this._playlistSources[0];
    }

    this.play();
  }

  playPrevious() {
    if (this._playlistItems) {
      this._playlistItems[this._currentPlaylistItemNumber].classList.remove(`${this._playlistItemClass}--current`);
      this._playlistItems[this._currentPlaylistItemNumber].classList.remove(`${this._playlistItemClass}--playing`);
      this._playlistItems[--this._currentPlaylistItemNumber].classList.add(`${this._playlistItemClass}--current`);
    } else {
      this._currentPlaylistItemNumber--;      
    }

    this._videoElement.src = this._playlistSources[this._currentPlaylistItemNumber];
    this.play();
  }

  stop() {
    this._videoElement.pause();
    this._videoElement.currentTime = 0;

    if (this._playlist && this._playlistItems) {
      this._playlistItems[this._currentPlaylistItemNumber].classList.remove(`${this._playlistItemClass}--playing`);
    }
  }

  unmute() {
    const lastVolume = localStorage.getItem(`lastPositiveVolume`);
    this._changeVolume(lastVolume);
    this._volumeSlider.changeValue(lastVolume);
    this._volumeButton.title = `Mute`;
    this._volumeButton.querySelector(`span`).textContent = `Mute`;
  }
  
  _addFullscreenChangeListener() {
    if (document.body.requestFullscreen) {
      window.addEventListener(`fullscreenchange`, this._onContainerFullscreenchange);
    } else if (document.body.webkitRequestFullscreen) {
      window.addEventListener(`webkitfullscreenchange`, this._onContainerFullscreenchange);
    } else if (document.body.msRequestFullscreen) {
      window.addEventListener(`MSFullscreenChange`, this._onContainerFullscreenchange);
    }
  }

  _createA11yText(text) {
    const element = document.createElement(`span`);
    element.classList.add(`visually-hidden`);
    element.textContent = text;
    
    return element;
  }

  _createBigPlay() {
    this._bigPlayPauseButton = this._createElement({
      element: `button`,
      classes: [`button`, `vplay__big-play`],
      attributes: [[`type`, `button`], [`title`, `Play Video`]],
      inner: [this._createA11yText(`Play Video`)],
    });

    this._bigPlayPauseButton.addEventListener(`click`, this._onPlayPauseClick);

    return this._bigPlayPauseButton;
  }

  _createElement(props) {
    const element = document.createElement(props.element);

    if (props.id) {
      element.id = props.id;
    }

    if (props.classes) {
      props.classes.forEach((className) => {
        element.classList.add(className);
      });
    }

    if (props.attributes) {
      props.attributes.forEach((item) => {
        element.setAttribute(item[0], item[1]);
      });
    }

    if (props.inner) {
      element.append(...props.inner)
    }

    return element;
  }

  _createLoader() {
    this._loader = this._createElement({
      element: `div`,
      classes: [`vplay__loader`, `lds-ring`],
      inner: [...new Array(4).fill(``).map(() => this._createElement({element: `div`}))],
    });

    return this._loader;
  }

  _createNextButton() {
    this._nextButton = this._createElement({
      element: `button`,
      classes: [`button`, `vplay__next`],
      attributes: [[`type`, `button`], [`title`, `Next video`]],
      inner: [this._createA11yText(`Next video`)],
    });

    this._nextButton.addEventListener(`click`, this._onNextButtonClick);

    return this._nextButton;
  }

  _createPlayPause() {
    this._playPauseButton = this._createElement({
      element: `button`,
      classes: [`button`, `vplay__play`],
      attributes: [[`type`, `button`], [`title`, `Play`]],
      inner: [this._createA11yText(`Play`)],
    });

    this._playPauseButton.addEventListener(`click`, this._onPlayPauseClick);

    return this._playPauseButton;
  }

  _createPreviousButton() {
    this._previousButton = this._createElement({
      element: `button`,
      classes: [`button`, `vplay__previous`],
      attributes: [[`type`, `button`], [`title`, `Previous video`]],
      inner: [this._createA11yText(`Previous video`)],
    });

    if (this._currentPlaylistItemNumber === 0) {
      this._previousButton.disabled = true;
    };

    this._previousButton.addEventListener(`click`, this._onPreviousButtonClick);

    return this._previousButton;
  }

  _createVolume() {
    this._volumeButton = this._createElement({
      element: `button`,
      classes: [`button`, `vplay__volume-mute`],
      attributes: [[`type`, `button`], [`title`, `Mute`]],
      inner: [this._createA11yText(`Mute`)],
    });

    const volumeLineFull = this._createElement({
      element: `div`,
      classes: [`vplay__volume-line`, `vplay__volume-line--full`],
    });

    const volumeLineCurrent = this._createElement({
      element: `div`,
      classes: [`vplay__volume-line`, `vplay__volume-line--current`],
    });

    const volumeBar = this._createElement({
      element: `div`,
      classes: [`vplay__volume-bar`],
      inner: [volumeLineFull, volumeLineCurrent],
    });

    const volume = this._createElement({
      element: `div`,
      classes: [`vplay__volume`],
      inner: [this._volumeButton, volumeBar],
    });

    this._volumeSlider = new DragNDrop(volumeBar, volumeLineCurrent, {onChange: this._changeVolume, onTotalChange: this._rememberVolume});
    this._volume = volume;

    this._volumeButton.addEventListener(`click`, (evt) => {
      evt.preventDefault();

      if (Number(this._volumeSlider.value)) {
        this.mute();
      } else {
        this.unmute();
      }
    });

    return volume;
  }

  _createCurrentTime() {
    this._currentTime = this._createElement({
      element: `span`,
      classes: [`vplay__time`, `vplay__time--current`],
      inner: [`-:-`],
    });

    return this._currentTime;
  }

  _createFullTime() {
    this._fullTime = this._createElement({
      element: `span`,
      classes: [`vplay__time`, `vplay__time--full`],
      inner: [`-:-`],
    });

    return this._fullTime;
  }

  _createProgressBar() {
    this._timeTooltip = this._createElement({
      element: `div`,
      classes: [`vplay__time-tooltip`],
      inner: [`-:-`],
    });
    
    const full = this._createElement({
      element: `div`,
      classes: [`vplay__full`],
    });

    this._lostVideoLine = this._createElement({
      element: `div`,
      classes: [`vplay__lost`],
    });

    this._loadedVideoLine = this._createElement({
      element: `div`,
      classes: [`vplay__loaded`],
    });

    const bar = this._createElement({
      element: `div`,
      classes: [`vplay__progress-bar`],
      inner: [full, this._loadedVideoLine, this._lostVideoLine, this._timeTooltip],
    });

    this._progressBar = new DragNDrop(bar, this._lostVideoLine, { onChange: this._pauseOnVideoTimeupdate, onTotalChange: this._updateCurrentTime });
    bar.addEventListener(`mousemove`, this._onProgressBarMousemove);
    bar.addEventListener(`touchmove`, this._onProgressBarTouchmove, {passive: true});

    return bar;
  }

  _createSpeedBar() {
    if (this._speeds) {      
      this._speedItems = this._speeds.map((item) => {
        if (item === 1) {
          return this._createElement({
            element: `li`,
            classes: [`vplay__speed-item`, `vplay__speed-item--current`],
            inner: [item],
          });
        } else {
          return this._createElement({
            element: `li`,
            classes: [`vplay__speed-item`],
            inner: [item],
          });
        }
      })

      const speedList = this._createElement({
        element: `ul`,
        classes: [`vplay__speed-list`],
        inner: [...this._speedItems],
      });

      const buttonText = this._createElement({
        element: `span`,
        classes: [`vplay__button-text`],
        inner: [1],
      });

      this._speedButton = this._createElement({
        element: `button`,
        classes: [`button`, `vplay__speed`],
        attributes: [[`type`, `button`], [`title`, `Playback Rate`]],
        inner: [this._createA11yText(`Playback Rate`), buttonText],
      });

      const bar = this._createElement({
        element: `div`,
        classes: [`vplay__speed-bar`],
        inner: [this._speedButton, speedList],
      });

      this._speedButton.addEventListener(`click`, () => {
        const currentSpeedIndex = this._speeds.findIndex((item) => item === this._currentSpeed);
        const nextSpeed = currentSpeedIndex === (this._speeds.length - 1) ?
          this._speeds[0] :
          this._speeds[currentSpeedIndex + 1]
          this._changeSpeed(nextSpeed);
      })

      this._speedItems.forEach((item, index) => {
        item.addEventListener(`click`, () => {
          this._changeSpeed(this._speeds[index]);
        });
      });

      return bar;
    }

    return false;
  }

  _createFullscreen() {
    this._fullScreenButton = this._createElement({
      element: `button`,
      classes: [`button`, `vplay__fullscreen`],
      attributes: [[`type`, `button`], [`title`, `Fullscreen`]],
      inner: [this._createA11yText(`Fullscreen`)],
    });

    this._fullScreenButton.addEventListener(`click`, this._onFullscreenClick);

    return this._fullScreenButton;
  }

  _createControlsBar() {
    const controlBar = this._createElement({
      element: `div`,
      classes: [`vplay__controls`],
      inner: [
        this._playlistNavigation ? this._createPreviousButton() : ``,
        this._createPlayPause(),
        this._playlistNavigation ? this._createNextButton() : ``,
        this._createVolume(),
        this._createCurrentTime(),
        this._createFullTime(),
        this._createProgressBar(),
        this._speeds && this._createSpeedBar(),
        this._createFullscreen(),
      ],
    });

    window.addEventListener(`mousemove`, (evt) => {
      if (evt.target.closest(`.vplay__controls`)) {
        controlBar.classList.add(`vplay__controls--hover`);
      } else {
        controlBar.classList.remove(`vplay__controls--hover`);
      }
    });

    this._container.append(controlBar, this._createBigPlay(), this._createLoader());
  }

  _changeVolume(value) {
    const valueNumber = Number(value);
    this._videoElement.volume = value / 100;
    
    if (valueNumber === 0) {
      this._updateVolumeClass(VolumeClasses.level1);
    } else if (valueNumber > 0 && valueNumber <= 33) {
      this._updateVolumeClass(VolumeClasses.level2);
    } else if (valueNumber > 33 && valueNumber <= 66) {
      this._updateVolumeClass(VolumeClasses.level3);
    } else {
      this._updateVolumeClass(VolumeClasses.level4);
    }
  }

  _changeSpeed(speed) {
    if (speed !== this._videoElement.playbackRate) {
      const currentsSpeedItemIndex = this._speeds.findIndex((item) => item === this._currentSpeed);
      const requestedSpeedItemIndex = this._speeds.findIndex((item) => item === speed);

      this._videoElement.playbackRate = speed;
      this._currentSpeed = speed;

      this._speedItems[currentsSpeedItemIndex].classList.remove(`vplay__speed-item--current`);
      this._speedItems[requestedSpeedItemIndex].classList.add(`vplay__speed-item--current`);

      this._speedButton.querySelector(`.vplay__button-text`).textContent = speed;
    }
  }

  _endPlaying() {
    this._container.classList.remove(`vplay--played`);
    this._container.classList.add(`vplay--ended`);
    this._playPauseButton.title = `Replay`;
    this._playPauseButton.querySelector(`span`).textContent = `Replay`;
  }

  _enterFullscreen() {
    if (this._container.requestFullscreen) {
      this._container.requestFullscreen();
    } else if (this._container.webkitRequestFullscreen) {
      this._container.webkitRequestFullScreen();
    } else if (this._container.msRequestFullscreen) {
      this._container.msRequestFullscreen();
    }
  }

  _exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  _toggleFullscreenButton() {
    if (!this._fullScreenButton.classList.contains(`vplay__fullscreen--active`)) {
      
      this._fullScreenButton.classList.add(`vplay__fullscreen--active`);
      this._fullScreenButton.title = `Non Fullscreen`;
      this._fullScreenButton.querySelector(`span`).textContent = `Non Fullscreen`;
      this._container.querySelector(`.vplay__controls`).classList.remove(`vplay__controls--hover`);
    } else {
      this._fullScreenButton.classList.remove(`vplay__fullscreen--active`);
      this._fullScreenButton.title = `Fullscreen`;
      this._fullScreenButton.querySelector(`span`).textContent = `Fullscreen`;
    }
  }

  _initPlaylist() {
    this._playlistNavigation = this._playlist.hasOwnProperty(`navigation`) ? this._playlist.navigation : true;
    this._currentPlaylistItemNumber = this._playlist.startItemNumber || 0;

    this._playlistSources = this._playlist.itemClass ?
      Array.from(document.querySelectorAll(this._playlist.itemClass)).map((item) => item.getAttribute(`data-vplay-src`)) :
      this._playlist.sources;

    if (this._videoElement.src !== this._playlistSources[this._currentPlaylistItemNumber]) {
      this._videoElement.src = this._playlistSources[this._currentPlaylistItemNumber];
    }

    if (this._playlist.itemClass) {
      this._initPlaylistItems();
    }
  }

  _initPlaylistItems() {
    this._playlistItems = Array.from(document.querySelectorAll(this._playlist.itemClass));
    this._playlistItemClass = this._playlist.itemClass.replace(`.`, ``);

    this._playlistItems[this._currentPlaylistItemNumber].classList.add(`${this._playlistItemClass}--current`);
    this._playlistItems.forEach((item) => {
      const buttons = [];

      if (item.hasAttribute(`data-vplay-button`)) {
        buttons.push(item);
      } else {
        Array.from(item.querySelectorAll(`*[data-vplay-button]`)).forEach((button) => buttons.push(button));
      }

      buttons.forEach((button) => button.addEventListener(`click`, this._onPlaylistButtonClick));
    })
  }

  _initVolume() {
    const volume = localStorage.getItem(`lastVolume`) || this._dafaultVolume;
    this._changeVolume(volume);
    this._volumeSlider.changeValue(volume);
  }

  _onContainerFullscreenchange(evt) {
    this._container.classList.toggle(`vplay--fullscreen`);
    this._toggleFullscreenButton();
  }

  _onFullscreenClick(evt) {
    evt.preventDefault();

    if (document.fullscreenElement && document.fullscreenElement.classList.contains(`vplay`) ||
      document.webkitFullscreenElement && document.webkitFullscreenElement.classList.contains(`vplay`) ||
      document.msFullscreenElement && document.msFullscreenElement.classList.contains(`vplay`)) {
      this._exitFullscreen();
    } else {
      this._enterFullscreen();
    };
  }

  _onVideoEnd() {
    if (this._loop && !(this._playlist && this._playlist.autoplayNext)) {
      this.play();
    } else if (this._playlist && this._playlist.autoplayNext) {
      if (this._playlist.loop || (this._playlistItems && this._currentPlaylistItemNumber !== this._playlistItems.length - 1)) {
        this.playNext();
      } else {
        this._endPlaying();
      }
    } else {
      this._endPlaying();
    }
  }

  _onVideoLoadMeta() {
    this._fullTime.textContent = formatTime(this._videoElement.duration);
    this._currentTime.textContent = `0:00`;
    this._changeSpeed(this._currentSpeed);
  }

  _onVideoProgress() {
    this._updateLoadedVideoLine();
  }

  _onVideoSeeking() {
    this._container.classList.add(`vplay--loading`);
  }

  _onVideoSeeked() {
    this._container.classList.remove(`vplay--loading`);
  }

  _onVideoTimeupdate() {
    const currentTime = this._videoElement.currentTime;
    this._currentTime.textContent = formatTime(currentTime);
    this._updateLostVideoLine(currentTime);
  }

  _onNextButtonClick(evt) {
    evt.preventDefault();
    this.playNext();
  }

  _onPlaylistButtonClick(evt) {
    evt.preventDefault();
    const itemNumber = this._playlistItems.findIndex((item) => item === evt.target.closest(this._playlist.itemClass));

    if (itemNumber !== this._currentPlaylistItemNumber) {
      this._playlistItems[this._currentPlaylistItemNumber].classList.remove(`${this._playlistItemClass}--current`);
      this._playlistItems[this._currentPlaylistItemNumber].classList.remove(`${this._playlistItemClass}--playing`);
      this._playlistItems[itemNumber].classList.add(`${this._playlistItemClass}--current`);
      const src = this._playlistSources[itemNumber];
      this._currentPlaylistItemNumber = itemNumber;
      this._videoElement.src = src;
      this.play();
    } else if (itemNumber === this._currentPlaylistItemNumber && this._videoElement.paused) {
      this.play();
    } else {
      this.pause();
    }
    
  }

  _onPlayPauseClick(evt) {
    evt.preventDefault();
    this._videoElement.paused ? this.play() : this.pause();
  }

  _onPreviousButtonClick(evt) {
    evt.preventDefault();

    if (this._currentPlaylistItemNumber !== 0) {
      this.playPrevious();
    }
  }

  _onProgressBarMousemove(evt) {
    const barCoords = evt.currentTarget.getBoundingClientRect();
    const positionX = evt.clientX - Math.floor(barCoords.left);

    this._updateTimeTooltip(barCoords, positionX);
  }

  _onProgressBarTouchmove(evt) {
    const barCoords = evt.currentTarget.getBoundingClientRect();
    const positionX = evt.changedTouches[0].clientX - Math.floor(barCoords.left);

    if (positionX >= 0 && positionX <= Math.ceil(barCoords.width)) {
      this._updateTimeTooltip(barCoords, positionX);
    }
  }

  _pauseOnVideoTimeupdate() {
    this._videoElement.removeEventListener(`timeupdate`, this._onVideoTimeupdate);
  }

  _rememberVolume(value) {
    if (value) {
      localStorage.setItem(`lastVolume`, value);
      localStorage.setItem(`lastPositiveVolume`, value);
    } else {
      localStorage.setItem(`lastVolume`, value);
    }
  }

  _startTarackingUserActivity() {
    setInterval(() => {
      this._userSleepSeconds = this._userSleepSeconds + 0.1;
    }, 100);

    setInterval(() => {
      if (this._userSleepSeconds >= this._userSleepDelay) {
        this._container.classList.add(`vplay--user-sleep`);
      } else {
        this._container.classList.remove(`vplay--user-sleep`);
      }
    }, 100);

    document.addEventListener(`mousemove`, () => {
      this._userSleepSeconds = 0;
    });

    document.addEventListener(`touchmove`, () => {      
      this._userSleepSeconds = 0;
    })
  }

  _wrapVideoElement() {
    this._container = this._createElement({
      element: `div`,
      classes: [`vplay`],
    });

    this._videoElement.classList.remove(`vplay`);
    this._videoElement.classList.add(`vplay__video`);
    this._videoElement.removeAttribute(`controls`);
    this._videoElement.before(this._container);
    this._videoElement.remove();
    this._container.append(this._videoElement);
  }

  _updateCurrentTime(value) {
    this._videoElement.currentTime = this._videoElement.duration / 100 * value;
    this._videoElement.addEventListener(`timeupdate`, this._onVideoTimeupdate);
  }

  _updateLoadedVideoLine() {
    if (this._videoElement.buffered.length) {
      const lineWindth = this._videoElement.buffered.end(this._videoElement.buffered.length - 1) / this._videoElement.duration * 100;
      this._loadedVideoLine.style.width = `${lineWindth ? lineWindth : 0}%`;
    }
  }

  _updateLostVideoLine(currentTime) {
    const value = timeToPercent(currentTime, this._videoElement.duration)
    this._progressBar.changeValue(value);
  }

  _updateTimeTooltip(barCoords, positionX) {
    const value = positionX / barCoords.width * 100;
    const time = formatTime(this._videoElement.duration * value / 100);
    this._timeTooltip.textContent = time;
    this._timeTooltip.style.left = value + '%';
  }

  _updateVolumeClass(className) {
    if (!this._volume.classList.contains(className)) {
      const classes = Array.from(this._volume.classList);

      if (classes.length > 1) {
        this._volume.classList.remove(classes.reverse()[0]);
      }
      this._volume.classList.add(className);
    }
  }
}
