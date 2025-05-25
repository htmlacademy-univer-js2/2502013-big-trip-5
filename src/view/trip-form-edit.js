import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {EVENT_TYPES} from '../const';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class TripFormEdit extends AbstractStatefulView {
  #submitHandler = null;
  #deleteHandler = null;
  #cancelHandler = null;
  #destinations = [];
  #offers = [];
  #isDisabled = false;
  #isSaving = false;
  #isDeleting = false;

  constructor(pointData, destinations = [], offers = []) {
    super();
    this._state = {...pointData};
    this.#destinations = destinations;
    this.#offers = offers;
    this._restoreHandlers();
  }

  get template() {
    const { type, startTime, endTime, price } = this._state;
    const startValue = dayjs(startTime).format('DD/MM/YY HH:mm');
    const endValue = dayjs(endTime).format('DD/MM/YY HH:mm');
    const offers = this.#getOffersForType(type);
    const destination = this.#destinations.find((dest) => dest.id === this._state.destination) ?? {
      id: '',
      name: '',
      description: '',
      pictures: [],
    };
    const offersMarkup = offers.length
      ? `<div class="event__available-offers">
          ${offers.map((offer) => `
            <div class="event__offer-selector">
              <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" ${this._state.offers.some((o) => o.id === offer.id) ? 'checked' : ''} ${this.#isDisabled ? 'disabled' : ''}>
              <label class="event__offer-label" for="event-offer-${offer.id}">
                <span class="event__offer-title">${offer.title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${offer.price}</span>
              </label>
            </div>`).join('')}
        </div>`
      : '';

    const photosMarkup = destination.pictures?.length
      ? `<div class="event__photos-container">
           <div class="event__photos-tape">
             ${destination.pictures.map((photo) => `<img class="event__photo" src="${photo.src}" alt=${photo.description}>`).join('')}
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
                  <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${this.#isDisabled ? 'disabled' : ''}>

                  <div class="event__type-list">
                      <fieldset class="event__type-group" ${this.#isDisabled ? 'disabled' : ''}>
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
                                ${this.#isDisabled ? 'disabled' : ''}
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
                  <input required class="event__input  event__input--destination" id="event-destination-1" type="text"
                         name="event-destination"
                          value="${destination.name}"
                          list="destination-list-1"
                          ${this.#isDisabled ? 'disabled' : ''}>
                  <datalist id="destination-list-1">
                      ${this.#destinations.map((dest) => `
                        <option value="${dest.name}">${dest.name}</option>
                      `).join('')}
                  </datalist>
              </div>

              <div class="event__field-group  event__field-group--time">
                  <label class="visually-hidden" for="event-start-time-1">From</label>
                  <input class="event__input  event__input--time" id="event-start-time-1" type="text"
                         name="event-start-time" value="${startValue}" ${this.#isDisabled ? 'disabled' : ''}>
                  &mdash;
                  <label class="visually-hidden" for="event-end-time-1">To</label>
                  <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time"
                         value="${endValue}" ${this.#isDisabled ? 'disabled' : ''}>
              </div>

              <div class="event__field-group  event__field-group--price">
                  <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                  </label>
                  <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price"
                         value="${price}" ${this.#isDisabled ? 'disabled' : ''}>
              </div>

              <button class="event__save-btn  btn  btn--blue" type="submit" ${this.#isDisabled ? 'disabled' : ''}>
                ${this.#isSaving ? 'Saving...' : 'Save'}
              </button>
              <button class="event__reset-btn" type="reset" ${this.#isDisabled ? 'disabled' : ''}>
                ${this.#isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button class="event__rollup-btn" type="button" ${this.#isDisabled ? 'disabled' : ''}>
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

  #getOffersForType(type) {
    const offerGroup = this.#offers.find((group) => group.type === type);
    return offerGroup ? offerGroup.offers : [];
  }

  #typeChangeHandler = (evt) => {
    const type = evt.target.value;
    this.updateElement({ type, offers: this.#getOffersForType(type) });
  };

  #destinationChangeHandler = (evt) => {
    const dest = this.#destinations.find((d) => d.name === evt.target.value);
    if (dest) {
      this.updateElement({
        destination: dest.id,
      });
    } else {
      this.updateElement({
        destination: this._state.destination,
      });
    }
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({ price: Number(evt.target.value) });
  };

  #offerChangeHandler = (evt) => {
    const offerId = evt.target.id.replace('event-offer-', '');
    const currentOffers = [...this._state.offers];
    if (evt.target.checked) {
      const newOffer = this.#getOffersForType(this._state.type).find((offer) => offer.id === offerId);
      if (newOffer) {
        currentOffers.push(newOffer);
      }
    } else {
      const index = currentOffers.findIndex((offer) => offer.id === offerId);
      if (index !== -1) {
        currentOffers.splice(index, 1);
      }
    }
    this.updateElement({ offers: currentOffers });

  };

  setFormSubmitHandler(callback) {
    this.#submitHandler = callback;
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
  }

  setCancelClickHandler(callback) {
    this.#cancelHandler = callback;
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#cancelClickHandler);
  }

  setDeleteClickHandler(callback) {
    this.#deleteHandler = callback;
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
  }

  _restoreHandlers() {
    this.element.querySelectorAll('input[name="event-type"]').forEach((input) => input.addEventListener('change', this.#typeChangeHandler));
    this.element.querySelector('input[name="event-destination"]').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceChangeHandler);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((checkbox) => checkbox.addEventListener('change', this.#offerChangeHandler));
    if (this.#submitHandler) {
      this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    }
    if (this.#cancelHandler) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#cancelClickHandler);
    }
    this.#setFlatpickr();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#submitHandler?.(this._state);
  };

  #cancelClickHandler = (evt) => {
    evt.preventDefault();
    this.#cancelHandler?.();
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#deleteHandler?.(this._state.id);
  };

  #onStartTimeChange = ([selectedDate]) => {
    if (this._state.endTime < selectedDate) {
      this.updateElement({ endTime: selectedDate });
    }
    this.updateElement({ startTime: selectedDate });
  };

  #onEndTimeChange = ([selectedDate]) => {
    if (this._state.startTime > selectedDate) {
      this.updateElement({ startTime: selectedDate });
    }
    this.updateElement({ endTime: selectedDate });
  };

  #setFlatpickr() {
    flatpickr(this.element.querySelector('#event-start-time-1'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.startTime,
      onChange: this.#onStartTimeChange,
    });
    flatpickr(this.element.querySelector('#event-end-time-1'), {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.endTime,
      onChange: this.#onEndTimeChange,
    });
  }

  setFormState({isDisabled = false, isSaving = false, isDeleting = false} = {}) {
    this.#isDisabled = isDisabled;
    this.#isSaving = isSaving;
    this.#isDeleting = isDeleting;

    this.element.querySelectorAll('input, button').forEach((element) => {
      element.disabled = isDisabled;
    });

    if (isSaving) {
      this.element.querySelector('.event__save-btn').textContent = 'Saving...';
    } else {
      this.element.querySelector('.event__save-btn').textContent = 'Save';
    }

    if (isDeleting) {
      this.element.querySelector('.event__reset-btn').textContent = 'Deleting...';
    } else {
      this.element.querySelector('.event__reset-btn').textContent = 'Delete';
    }
  }
}
