import FiltersView from '../view/filters.js';
import {FILTER_TYPE, UPDATE_TYPE} from '../model/filter-model.js';
import {render} from '../render';
import {remove} from '../framework/render';

export default class FilterPresenter {
  #filterModel;
  #pointsModel;
  #filtersComponent;
  #container;

  #handleFilterTypeChange = (filterType) => {
    this.#filterModel.setFilter(UPDATE_TYPE.FILTER, filterType);
  };

  #handleModelEvent = (updateType) => {
    if (updateType === UPDATE_TYPE.FILTER || updateType === UPDATE_TYPE.INIT || updateType === UPDATE_TYPE.UPDATE) {
      this.init();
    }
  };

  constructor(filterContainer, filterModel, pointsModel) {
    this.#container = filterContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#filtersComponent = null;
    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  #getFilterAvailability(filterType, points) {
    if (!points.length) {
      return false;
    }

    switch (filterType) {
      case FILTER_TYPE.FUTURE:
        return points.some((p) => new Date(p.startTime) > Date.now());
      case FILTER_TYPE.PRESENT:
        return points.some((p) => new Date(p.startTime) <= Date.now() && new Date(p.endTime) >= Date.now());
      case FILTER_TYPE.PAST:
        return points.some((p) => new Date(p.endTime) < Date.now());
      case FILTER_TYPE.EVERYTHING:
        return points.length > 0;
      default:
        return true;
    }
  }

  init() {
    const points = this.#pointsModel?.getPoints() || [];
    const filtersData = [
      {
        name: FILTER_TYPE.EVERYTHING,
        label: 'Everything',
        isChecked: this.#filterModel.getFilter() === FILTER_TYPE.EVERYTHING,
        isDisabled: !this.#getFilterAvailability(FILTER_TYPE.EVERYTHING, points)
      },
      {
        name: FILTER_TYPE.FUTURE,
        label: 'Future',
        isChecked: this.#filterModel.getFilter() === FILTER_TYPE.FUTURE,
        isDisabled: !this.#getFilterAvailability(FILTER_TYPE.FUTURE, points)
      },
      {
        name: FILTER_TYPE.PRESENT,
        label: 'Present',
        isChecked: this.#filterModel.getFilter() === FILTER_TYPE.PRESENT,
        isDisabled: !this.#getFilterAvailability(FILTER_TYPE.PRESENT, points)
      },
      {
        name: FILTER_TYPE.PAST,
        label: 'Past',
        isChecked: this.#filterModel.getFilter() === FILTER_TYPE.PAST,
        isDisabled: !this.#getFilterAvailability(FILTER_TYPE.PAST, points)
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
