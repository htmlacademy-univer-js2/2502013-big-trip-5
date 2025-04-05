import AbstractView from '../framework/view/abstract-view.js';

export default class TripPoint extends AbstractView {
  constructor(pointData) {
    super();
    this._point = pointData;
  }

  get template() {
    const date = this._point.startTime.split('T')[0];
    const startTime = this._point.startTime.substring(11, 16);
    const endTime = this._point.endTime.substring(11, 16);
    const title = `${this._point.type} to ${this._point.destination.name}`;
    const offersMarkup = this._point.offers?.length
      ? `<h4 class="visually-hidden">Offers:</h4>
         <ul class="event__selected-offers">
           ${this._point.offers.map((offer) => `<li class="event__offer">
             <span class="event__offer-title">${offer.title}</span>
             &plus;&euro;&nbsp;
             <span class="event__offer-price">${offer.price}</span>
           </li>`).join('')}
         </ul>`
      : '';

    return `<li class="trip-events__item">
  <div class="event">
    <time class="event__date" datetime="${date}">${date}</time>
    <div class="event__type">
      <img class="event__type-icon" width="42" height="42" src="img/icons/${this._point.type}.png" alt="Event type icon">
    </div>
    <h3 class="event__title">${title}</h3>
    <div class="event__schedule">
      <p class="event__time">
        <time class="event__start-time" datetime="${this._point.startTime}">${startTime}</time>
        &mdash;
        <time class="event__end-time" datetime="${this._point.endTime}">${endTime}</time>
      </p>
    </div>
    <p class="event__price">
      &euro;&nbsp;<span class="event__price-value">${this._point.price}</span>
    </p>
    ${offersMarkup}
    <button class="event__favorite-btn" type="button">
      <span class="visually-hidden">Add to favorite</span>
      <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
        <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"></path>
      </svg>
    </button>
    <button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>
  </div>
</li>`;
  }

  setEditClickHandler(handler) {
    this.element.querySelector('.event__rollup-btn').addEventListener('click', handler);
  }
}
