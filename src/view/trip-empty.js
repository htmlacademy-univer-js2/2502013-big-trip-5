import AbstractView from '../framework/view/abstract-view.js';
import { FILTER_TYPE } from '../model/filter-model.js';

export default class TripEmpty extends AbstractView {
  #filterType;
  constructor(filterType = FILTER_TYPE.EVERYTHING) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    const Message = {
      [FILTER_TYPE.EVERYTHING]: 'Click New Event to create your first point',
      [FILTER_TYPE.PAST]: 'There are no past events now',
      [FILTER_TYPE.PRESENT]: 'There are no present events now',
      [FILTER_TYPE.FUTURE]: 'There are no future events now',
    };
    return `<p class="trip-events__msg">${Message[this.#filterType]}</p>`;
  }
}
