import { createElement } from '../render.js';

export default class Filters {
  constructor() {
    this._element = null;
  }

  getTemplate() {
    return `<div class="trip-controls__filters">
  <h2 class="visually-hidden">Filter events</h2>
  <form class="trip-filters" action="#" method="get">
    <div class="trip-filters__filter">
      <input id="filter-everything" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="everything" checked>
      <label class="trip-filters__filter-label" for="filter-everything">Everything</label>
    </div>
    <div class="trip-filters__filter">
      <input id="filter-future" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="future" disabled>
      <label class="trip-filters__filter-label" for="filter-future">Future</label>
    </div>
    <div class="trip-filters__filter">
      <input id="filter-present" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="present">
      <label class="trip-filters__filter-label" for="filter-present">Present</label>
    </div>
    <div class="trip-filters__filter">
      <input id="filter-past" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="past" disabled>
      <label class="trip-filters__filter-label" for="filter-past">Past</label>
    </div>
    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>
</div>`;
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
