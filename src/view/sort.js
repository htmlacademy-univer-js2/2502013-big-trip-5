import AbstractView from '../framework/view/abstract-view.js';

export default class Sort extends AbstractView {
  constructor(sortTypes) {
    super();
    this._sortTypes = sortTypes;
  }

  get template() {
    const sortItemsMarkup = this._sortTypes.map((item) => {
      if (item.type === 'radio') {
        return `<div class="trip-sort__item  trip-sort__item--${item.value}">
    <input id="sort-${item.value}" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-${item.value}" data-sort-type="${item.value}" ${item.isChecked ? 'checked' : ''} ${item.isDisabled ? 'disabled' : ''}>
    <label class="trip-sort__btn" for="sort-${item.value}">${item.label}</label>
  </div>`;
      } else {
        return `<div class="trip-sort__item  trip-sort__item--${item.value}">
    <span class="trip-sort__btn">${item.label}</span>
  </div>`;
      }
    }).join('');
    return `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    ${sortItemsMarkup}
  </form>`;
  }

  setSortTypeChangeHandler(callback) {
    this._callback = callback;
    this.element.addEventListener('change', this._sortTypeChangeHandler);
  }

  _sortTypeChangeHandler = (evt) => {
    const sortType = evt.target.dataset.sortType;
    if (!sortType || !this._callback) {
      return;
    }
    evt.preventDefault();
    this._callback(sortType);
  };
}
