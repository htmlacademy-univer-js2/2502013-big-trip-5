import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {EventTypes} from '../const';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

export default class TripFormView extends AbstractStatefulView {
  #submitHandler = null;
  #deleteHandler = null;
  #cancelHandler = null;
  #destinations = [];
  #offers = [];
  #isDisabled = false;
  #isSaving = false;
  #isDeleting = false;
  #isNewPoint = false;

  constructor(pointData, destinations = [], offers = [], isNewPoint = false) {
    super();
    this._state = {...pointData};
    this.#destinations = destinations;
    this.#offers = offers;
    this.#isNewPoint = isNewPoint;
    this._restoreHandlers();
  }

  get template() {
    const { type, startTime, endTime, price } = this._state;
    const startValue = startTime ? dayjs(startTime).format('DD/MM/YY HH:mm') : '';
    const endValue = endTime ? dayjs(endTime).format('DD/MM/YY HH:mm') : '';
    const currentOffers = this.#getOffersForType(type);
    const destination = this.#destinations.find((dest) => dest.id === this._state.destination) ?? {
      id: '',
      name: '',
      description: '',
      pictures: [],
    };

    const commonDisabledAttr = this.#isDisabled ? 'disabled' : '';

    const hasOffers = currentOffers.length > 0;
    const hasPhotos = destination.pictures?.length > 0;
    const hasDescription = !!destination.description?.trim();

    const offersMarkup = hasOffers
      ? `<section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${currentOffers.map((offer) => `
                <div class="event__offer-selector">
                  <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" ${this._state.offers.some((selectedOffer) => selectedOffer === offer.id) ? 'checked' : ''} ${commonDisabledAttr}>
                  <label class="event__offer-label" for="event-offer-${offer.id}">
                    <span class="event__offer-title">${offer.title}</span>
                    &plus;&euro;&nbsp;
                    <span class="event__offer-price">${offer.price}</span>
                  </label>
                </div>`).join('')}
            </div>
        </section>`
      : '';

    const photosMarkup = hasPhotos
      ? `<div class="event__photos-container">
           <div class="event__photos-tape">
             ${destination.pictures.map((photo) => `<img class="event__photo" src="${photo.src}" alt='${photo.description}'>`).join('')}
           </div>
         </div>`
      : '';

    const descriptionMarkup = hasDescription
      ? `<p class="event__destination-description">${destination.description}</p>`
      : '';

    const destinationSectionMarkup = (hasDescription || hasPhotos)
      ? `<section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            ${descriptionMarkup}
            ${photosMarkup}
         </section>`
      : '';

    const hasEventDetails = hasOffers || hasDescription || hasPhotos;

    const eventDetailsMarkup = hasEventDetails
      ? `<section class="event__details">
            ${offersMarkup}
            ${destinationSectionMarkup}
         </section>`
      : '';

    let resetButtonText = 'Delete';
    if (this.#isNewPoint) {
      resetButtonText = 'Cancel';
    } else if (this.#isDeleting) {
      resetButtonText = 'Deleting...';
    }

    return `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
          <header class="event__header">
              <div class="event__type-wrapper">
                  <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                  </label>
                  <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${commonDisabledAttr}>

                  <div class="event__type-list">
                      <fieldset class="event__type-group" ${commonDisabledAttr}>
                          <legend class="visually-hidden">Event type</legend>
                          ${EventTypes.map(({type: evtType, label}) => `
                            <div class="event__type-item">
                              <input
                                id="event-type-${evtType}-1"
                                class="event__type-input visually-hidden"
                                type="radio"
                                name="event-type"
                                value="${evtType}"
                                ${evtType === type ? 'checked' : ''}
                                ${commonDisabledAttr}
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
                          ${commonDisabledAttr}>
                  <datalist id="destination-list-1">
                      ${this.#destinations.map((dest) => `
                        <option value="${dest.name}">${dest.name}</option>
                      `).join('')}
                  </datalist>
              </div>

              <div class="event__field-group  event__field-group--time">
                  <label class="visually-hidden" for="event-start-time-1">From</label>
                  <input class="event__input  event__input--time" id="event-start-time-1" type="text"
                         name="event-start-time" value="${startValue}" ${commonDisabledAttr}>
                  &mdash;
                  <label class="visually-hidden" for="event-end-time-1">To</label>
                  <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time"
                         value="${endValue}" ${commonDisabledAttr}>
              </div>

              <div class="event__field-group  event__field-group--price">
                  <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      &euro;
                  </label>
                  <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price"
                         value="${price}" ${commonDisabledAttr}>
              </div>

              <button class="event__save-btn  btn  btn--blue" type="submit" ${commonDisabledAttr}>
                ${this.#isSaving ? 'Saving...' : 'Save'}
              </button>
              <button class="event__reset-btn" type="reset" ${commonDisabledAttr}>
                ${resetButtonText}
              </button>
              <button class="event__rollup-btn" type="button" ${commonDisabledAttr}>
                  <span class="visually-hidden">Close event</span>
              </button>
          </header>
          ${eventDetailsMarkup}
      </form>
  </li>`;
  }

  reset(pointData) {
    this.updateElement({...pointData});
  }

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
    if (this.#deleteHandler) {
      this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
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

  #getOffersForType(type) {
    const offerType = this.#offers.find((offerBlock) => offerBlock.type === type);
    return offerType ? offerType.offers : [];
  }

  #typeChangeHandler = (evt) => {
    const type = evt.target.value;
    this.updateElement({ type, offers: [] });
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
    if (evt.target.checked) {
      const newOffer = this.#getOffersForType(this._state.type).find((offer) => offer.id === offerId);
      if (newOffer) {
        this._state.offers.push(newOffer.id);
      }
    } else {
      this._state.offers = this._state.offers.filter((offer) => offer !== offerId);
    }
  };
}
