import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';

export default class TripPoint extends AbstractView {
  #destinations = [];
  #offers = [];

  constructor(pointData, destinations = [], offers = []) {
    super();
    this._point = pointData;
    this.#offers = offers;
    this.#destinations = destinations;
  }

  get template() {
    const dateISO = dayjs(this._point.startTime).format('YYYY-MM-DD');
    const dateDisplay = dayjs(this._point.startTime).format('MMM D').toUpperCase();
    const startTime = dayjs(this._point.startTime).format('HH:mm');
    const endTime = dayjs(this._point.endTime).format('HH:mm');
    const diffMs = dayjs(this._point.endTime).diff(dayjs(this._point.startTime));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`;
    const dest = this.#destinations.find((d) => d.id === this._point.destination);
    const title = `${this._point.type} to ${dest?.name || 'Unknown'}`;
    const pointOffers = this.#offers.find((o) => o.type === this._point.type)?.offers.filter((offer) => this._point.offers.includes(offer.id)) || [];
    const offersMarkup = pointOffers.length
      ? `<h4 class="visually-hidden">Offers:</h4>
         <ul class="event__selected-offers">
           ${pointOffers.map((offer) => `<li class="event__offer">
             <span class="event__offer-title">${offer.title}</span>
             &plus;&euro;&nbsp;
             <span class="event__offer-price">${offer.price}</span>
           </li>`).join('')}
         </ul>`
      : '';

    return `<li class="trip-events__item">
  <div class="event">
    <time class="event__date" datetime="${dateISO}">${dateDisplay}</time>
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
      <p class="event__duration">${duration}</p>
    </div>
    <p class="event__price">
      &euro;&nbsp;<span class="event__price-value">${this._point.price}</span>
    </p>
    ${offersMarkup}
    <button class="event__favorite-btn ${this._point.isFavorite ? 'event__favorite-btn--active' : ''}" type="button">
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

  setFavoriteClickHandler(handler) {
    this.element.querySelector('.event__favorite-btn').addEventListener('click', handler);
  }
}
