import Observable from '../framework/observable.js';

export const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export const UPDATE_TYPE = {
  FILTER: 'filter',
  LOADING: 'loading',
  ERROR: 'error',
  INIT: 'init',
};

export default class FilterModel extends Observable {
  #filter = FilterType.EVERYTHING;

  getFilter() {
    return this.#filter;
  }

  setFilter(updateType, filter) {
    if (this.#filter === filter) {
      return;
    }
    this.#filter = filter;
    this._notify(updateType, this.#filter);
  }
}
