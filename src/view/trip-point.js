import { createElement } from '../render.js';

export default class TripPoint {
  constructor() {
    this._element = null;
  }

  getTemplate() {
    return `<li class="trip-events__item">
  <div class="event">
    <time class="event__date" datetime="2020-09-10">10 Sep</time>
    <div class="event__type">
      <img class="event__type-icon" width="42" height="42" src="img/icons/taxi.png" alt="Event type icon">
    </div>
    <h3 class="event__title">Taxi to airport</h3>
    <div class="event__schedule">
      <p class="event__time">
        <time class="event__start-time" datetime="2020-09-10T10:00">10:00</time>
        &mdash;
        <time class="event__end-time" datetime="2020-09-10T11:00">11:00</time>
      </p>
    </div>
    <p class="event__price">
      &euro;&nbsp;<span class="event__price-value">20</span>
    </p>
  </div>
</li>`;
  }

  getElement() {
    if (!this._element) {
      this._element = createElement(this.getTemplate());
    }
    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
