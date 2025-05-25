import Observable from '../framework/observable.js';

export const FILTER_TYPE = {
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
  UPDATE: 'update',
};

export default class FilterModel extends Observable {
  #filter = FILTER_TYPE.EVERYTHING;

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
