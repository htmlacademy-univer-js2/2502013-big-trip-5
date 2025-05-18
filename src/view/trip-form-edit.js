import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { DESTINATIONS } from '../mock/trip-data.js';
import {EVENT_TYPES, OFFERS} from '../const';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class TripFormEdit extends AbstractStatefulView {
  constructor(pointData) {
    super();
    this._state = pointData || {
      type: EVENT_TYPES[0].type,
      destination: DESTINATIONS[0].id,
      startTime: Date.now(),
      endTime: Date.now(),
      price: 0,
    };
    this._submitHandler = null;
    this._cancelHandler = null;
    this._restoreHandlers();
    this._setFlatpickr();
  }

  get template() {
    const { type, startTime, endTime, price } = this._state;
    const startValue = dayjs(startTime).format('DD/MM/YY HH:mm');
    const endValue = dayjs(endTime).format('DD/MM/YY HH:mm');
    const offers = this._getOffersForType(type);
    const destination = DESTINATIONS.find((dest) => dest.id === this._state.destination);
    const offersMarkup = offers.length
      ? `<div class="event__available-offers">
          ${offers.map((offer) => `
            <div class="event__offer-selector">
              <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" checked>
              <label class="event__offer-label" for="event-offer-${offer.id}">
                <span class="event__offer-title">${offer.title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${offer.price}</span>
              </label>
            </div>`).join('')}
        </div>`
      : '';

    const photosMarkup = destination.photos?.length
      ? `<div class="event__photos-container">
           <div class="event__photos-tape">
             ${destination.photos.map((photo) => `<img class="event__photo" src="${photo}" alt="Event photo">`).join('')}
           </div>
         </div>`
      : '';

    return `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
          <header class="event__header">
              <div class="event__type-wrapper">
                  <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                  </label>
                  <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

                  <div class="event__type-list">
                      <fieldset class="event__type-group">
                          <legend class="visually-hidden">Event type</legend>
                          ${EVENT_TYPES.map(({type: evtType, label}) => `
                            <div class="event__type-item">
                              <input
                                id="event-type-${evtType}-1"
                                class="event__type-input visually-hidden"
                                type="radio"
                                name="event-type"
                                value="${evtType}"
                                ${evtType === type ? 'checked' : ''}
                              >
                              <label
                                class="event__type-label event__type-label--${evtType}"
                                for="event-type-${evtType}-1"
                              >${label}</label>
                            </div>
                          `).join('')}
                      </fieldset>
                  </div>
              </div>

              <div class="event__field-group  event__field-group--destination">
                  <label class="event__label  event__type-output" for="event-destination-1">
                      ${type}
                  </label>
                  <input class="event__input  event__input--destination" id="event-destination-1" type="text"
                         name="event-destination" value="${destination.id}" list="destination-list-1">
                  <datalist id="destination-list-1">
                      ${DESTINATIONS.map((dest) => `
                        <option value="${dest.id}">${dest.name}</option>
                      `).join('')}
                  </datalist>
              </div>

              <div class="event__field-group  event__field-group--time">
                  <label class="visually-hidden" for="event-start-time-1">From</label>
                  <input class="event__input  event__input--time" id="event-start-time-1" type="text"
                         name="event-start-time" value="${startValue}">
                  &mdash;
                  <label class="visually-hidden" for="event-end-time-1">To</label>
                  <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time"
                         value="${endValue}">
              </div>

              <div class="event__field-group  event__field-group--price">
                  <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                  </label>
                  <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price"
                         value="${price}">
              </div>

              <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
              <button class="event__reset-btn" type="reset">Delete</button>
              <button class="event__rollup-btn" type="button">
                  <span class="visually-hidden">Close event</span>
              </button>
          </header>
          <section class="event__details">
              <section class="event__section  event__section--offers">
                  <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                  ${offersMarkup}
              </section>

              <section class="event__section  event__section--destination">
                  <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                  <p class="event__destination-description">${destination.description}</p>
                  ${photosMarkup}
              </section>
          </section>
      </form>
  </li>`;
  }

  _getOffersForType(type) {
    return OFFERS[type] || [];
  }

  _typeChangeHandler = (evt) => {
    const type = evt.target.value;
    this.updateElement({ type, offers: this._getOffersForType(type) });
  };

  _destinationChangeHandler = (evt) => {
    const dest = DESTINATIONS.find((d) => d.id === evt.target.value);
    if (dest) {
      this.updateElement({
        destination: evt.target.value,
      });
    } else {
      this.updateElement({
        destination: this._state.destination,
      });
    }
  };

  setFormSubmitHandler(callback) {
    this._submitHandler = callback;
    this.element.querySelector('form').addEventListener('submit', this._formSubmitHandler);
  }

  setCancelClickHandler(callback) {
    this._cancelHandler = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this._cancelClickHandler);
  }

  _formSubmitHandler = (evt) => {
    evt.preventDefault();
    this._submitHandler?.(this._state);
  };

  _cancelClickHandler = (evt) => {
    evt.preventDefault();
    this._cancelHandler?.();
  };

  _restoreHandlers() {
    this.element.querySelectorAll('input[name="event-type"]').forEach((input) => input.addEventListener('change', this._typeChangeHandler));
    this.element.querySelector('input[name="event-destination"]').addEventListener('change', this._destinationChangeHandler);
    if (this._submitHandler) {
      this.element.querySelector('form').addEventListener('submit', this._formSubmitHandler);
    }
    if (this._cancelHandler) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this._cancelClickHandler);
    }
    this._setFlatpickr();
  }

  _onStartTimeChange = ([selectedDate]) => {
    if (this._state.endTime < selectedDate) {
      this.updateElement({ endTime: selectedDate });
    }
    this.updateElement({ startTime: selectedDate });
  };

  _onEndTimeChange = ([selectedDate]) => {
    if (this._state.startTime > selectedDate) {
      this.updateElement({ startTime: selectedDate });
    }
    this.updateElement({ endTime: selectedDate });
  };

  _setFlatpickr() {
    if (this._startPicker) {
      this._startPicker.destroy();
      this._endPicker.destroy();
    }
    this._startPicker = flatpickr(this.element.querySelector('#event-start-time-1'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.startTime,
      onChange: this._onStartTimeChange,
    });
    this._endPicker = flatpickr(this.element.querySelector('#event-end-time-1'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.endTime,
      onChange: this._onEndTimeChange,
    });
  }
}
