import AbstractView from '../framework/view/abstract-view.js';

export default class Filters extends AbstractView {
  constructor(filtersData) {
    super();
    this._filtersData = filtersData;
  }

  get template() {
    const filtersMarkup = this._filtersData.map((filter) => `
      <div class="trip-filters__filter">
        <input id="filter-${filter.name}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${filter.name}" ${filter.isChecked ? 'checked' : ''} ${filter.isDisabled ? 'disabled' : ''}>
        <label class="trip-filters__filter-label" for="filter-${filter.name}">${filter.label}</label>
      </div>
    `).join('');
    return `<div class="trip-controls__filters">
  <h2 class="visually-hidden">Filter events</h2>
  <form class="trip-filters" action="#" method="get">
    ${filtersMarkup}
    <button class="visually-hidden" type="submit">Accept filter</button>
  </form>
</div>`;
  }
}
