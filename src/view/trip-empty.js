import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../model/filter-model.js';

export default class TripEmpty extends AbstractView {
  #filterType;
  constructor(filterType = FilterType.EVERYTHING) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    const Message = {
      [FilterType.EVERYTHING]: 'Click New Event to create your first point',
      [FilterType.PAST]: 'There are no past events now',
      [FilterType.PRESENT]: 'There are no present events now',
      [FilterType.FUTURE]: 'There are no future events now',
    };
    return `<p class="trip-events__msg">${Message[this.#filterType]}</p>`;
  }
}
