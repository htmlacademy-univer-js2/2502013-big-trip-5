import FiltersView from '../view/filters.js';
import {FilterType, UPDATE_TYPE} from '../model/filter-model.js';
import {render} from '../render';
import {remove} from '../framework/render';

export default class FilterPresenter {
  #filterModel;
  #filtersComponent;
  #container;

  #handleFilterTypeChange = (filterType) => {
    this.#filterModel.setFilter(UPDATE_TYPE.FILTER, filterType);
  };

  #handleModelEvent = (updateType) => {
    if (updateType === UPDATE_TYPE.FILTER) {
      this.init();
    }
  };

  constructor(filterContainer, filterModel) {
    this.#container = filterContainer;
    this.#filterModel = filterModel;
    this.#filtersComponent = null;
  }

  init() {
    const filtersData = [
      {
        name: FilterType.EVERYTHING,
        label: 'Everything',
        isChecked: this.#filterModel.getFilter() === FilterType.EVERYTHING
      },
      {
        name: FilterType.FUTURE,
        label: 'Future',
        isChecked: this.#filterModel.getFilter() === FilterType.FUTURE
      },
      {
        name: FilterType.PRESENT,
        label: 'Present',
        isChecked: this.#filterModel.getFilter() === FilterType.PRESENT
      },
      {
        name: FilterType.PAST,
        label: 'Past',
        isChecked: this.#filterModel.getFilter() === FilterType.PAST
      }
    ];

    if (this.#filtersComponent) {
      remove(this.#filtersComponent);
    }

    this.#filtersComponent = new FiltersView(filtersData);
    this.#filtersComponent.setFilterChangeHandler(this.#handleFilterTypeChange);
    render(this.#filtersComponent, this.#container);

    this.#filterModel.addObserver(this.#handleModelEvent);
  }
}
