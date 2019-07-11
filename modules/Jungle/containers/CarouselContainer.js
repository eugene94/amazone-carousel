import { Carousel, Navigation } from '../components/index.js';
import Store from '../store/index.js';

import { isContainClass, mergeConfig, sleep } from '../utils/index.js';

export default class CarouselContainer {
  constructor({ classNameObj, options }) {
    const defaultOptions = {
      infinite: true,
      duration: 300,
      animation: 'cubic-bezier(0.240, -0.010, 0.400, 1.650)'
    };

    this.options = mergeConfig(defaultOptions, options);
    this.store = this.getStore(classNameObj);
    this.props = this.getProps();

    this.carousel = this.getCarousel(classNameObj);
    this.store.on(this.carousel);
    this.carousel.init();

    if ('nav' in classNameObj) {
      this.nav = this.getNavigation(classNameObj);
      this.store.on(this.nav);
      this.nav.init();
    }
  }

  getStore({ container }) {
    return new Store({
      currentItem: 1,
      itemLength: document.querySelector(container).children.length,
      infinite: this.options.infinite
    });
  }

  getProps() {
    return {
      currentItem: this.store.state.currentItem,
      itemLength: this.store.state.itemLength
    };
  }

  getCarousel(classNameObj) {
    return new Carousel({
      container: classNameObj.container,
      options: this.options,
      onClick: this.carouselClickHandler.bind(this),
      props: this.props
    });
  }

  getNavigation(classNameObj) {
    return new Navigation({
      nav: classNameObj.nav,
      options: this.options,
      onClick: this.navClickHandler.bind(this),
      props: this.props
    });
  }

  carouselClickHandler({ target }) {
    if (target.tagName !== 'BUTTON') return;

    const { state } = this.store;
    const { infinite } = this.options;

    const moveId = this.getMoveId(target);
    this.store.setState({ ...state, currentItem: moveId });

    if (infinite && this.carousel.isEndOfCards(moveId)) {
      this.moveNoTransition(moveId);
    }
  }

  getMoveId(target) {
    const { currentItem } = this.store.state;

    if (isContainClass(target, 'next')) {
      return currentItem + 1;
    }

    if (isContainClass(target, 'prev')) {
      return currentItem - 1;
    }
  }

  moveNoTransition(moveId) {
    const { state } = this.store;

    sleep(this.options.duration).then(_ => {
      const newMoveId = this.carousel.isFirst(moveId) ? state.itemLength : 1;

      this.carousel.move({ id: newMoveId, transition: false });
      this.store.setState({ ...state, currentItem: newMoveId }, { render: false });
    });
  }

  navClickHandler(evt) {
    const id = evt.target.dataset.id;
    if (!id) return;
    this.store.setState({ ...this.store.state, currentItem: parseInt(id) });
  }
}
