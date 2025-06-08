import FiltersView from '../view/filter-view.js';
import {FilterType, UpdateType} from '../model/filter-model.js';
import {render} from '../render';
import {remove} from '../framework/render';

export default class FilterPresenter {
  #filterModel;
  #pointsModel;
  #filtersComponent;
  #container;

  constructor(filterContainer, filterModel, pointsModel) {
    this.#container = filterContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#filtersComponent = null;

    this.#pointsModel.addObserver(this.#onModelEventHandler);
    this.#filterModel.addObserver(this.#onModelEventHandler);
  }

  init() {
    const points = this.#pointsModel?.getPoints() || [];
    const filtersData = [
      {
        name: FilterType.EVERYTHING,
        label: 'Everything',
        isChecked: this.#filterModel.getFilter() === FilterType.EVERYTHING,
        isDisabled: !this.#getFilterAvailability(FilterType.EVERYTHING, points)
      },
      {
        name: FilterType.FUTURE,
        label: 'Future',
        isChecked: this.#filterModel.getFilter() === FilterType.FUTURE,
        isDisabled: !this.#getFilterAvailability(FilterType.FUTURE, points)
      },
      {
        name: FilterType.PRESENT,
        label: 'Present',
        isChecked: this.#filterModel.getFilter() === FilterType.PRESENT,
        isDisabled: !this.#getFilterAvailability(FilterType.PRESENT, points)
      },
      {
        name: FilterType.PAST,
        label: 'Past',
        isChecked: this.#filterModel.getFilter() === FilterType.PAST,
        isDisabled: !this.#getFilterAvailability(FilterType.PAST, points)
      }
    ];

    if (this.#filtersComponent) {
      remove(this.#filtersComponent);
    }

    this.#filtersComponent = new FiltersView(filtersData);
    this.#filtersComponent.setFilterChangeHandler(this.#onFilterTypeChangeHandler);
    render(this.#filtersComponent, this.#container);
  }

  #getFilterAvailability(filterType, points) {
    if (!points.length) {
      return false;
    }

    switch (filterType) {
      case FilterType.FUTURE:
        return points.some((p) => new Date(p.startTime) > Date.now());
      case FilterType.PRESENT:
        return points.some((p) => new Date(p.startTime) <= Date.now() && new Date(p.endTime) >= Date.now());
      case FilterType.PAST:
        return points.some((p) => new Date(p.endTime) < Date.now());
      case FilterType.EVERYTHING:
        return points.length > 0;
      default:
        return true;
    }
  }

  #onFilterTypeChangeHandler = (filterType) => {
    this.#filterModel.setFilter(UpdateType.FILTER, filterType);
  };

  #onModelEventHandler = (updateType) => {
    if (updateType === UpdateType.FILTER || updateType === UpdateType.INIT || updateType === UpdateType.UPDATE) {
      this.init();
    }
  };
}
