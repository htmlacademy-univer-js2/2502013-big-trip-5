import { render, RenderPosition } from '../render.js';
import Filters from '../view/filters.js';
import Sort from '../view/sort.js';
import TripEmpty from '../view/trip-empty.js';
import PointPresenter from './point-presenter.js';

export default class TripPresenter {
  constructor(model) {
    this._model = model;
    this._pointPresenters = [];
    this._currentSortType = 'day';
    this._sortComponent = null;
    this._eventsContainer = null;
    this._eventsListContainer = null;
  }

  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    const points = this._model.getPoints();
    const filtersData = [
      { name: 'everything', label: 'Everything', isChecked: true, isDisabled: points.length === 0 },
      { name: 'future', label: 'Future', isChecked: false, isDisabled: !points.some((point) => point.date > Date.now()) },
      { name: 'present', label: 'Present', isChecked: false, isDisabled: points.length === 0 },
      { name: 'past', label: 'Past', isChecked: false, isDisabled: !points.some((point) => point.date < Date.now()) }
    ];
    const filtersComponent = new Filters(filtersData);
    render(filtersComponent, filtersContainer);

    this._eventsContainer = document.querySelector('.trip-events');
    this._eventsListContainer = document.querySelector('.trip-events__list');

    const sortTypes = [
      { type: 'radio', value: 'day', label: 'Day', isChecked: true, isDisabled: points.length === 0 },
      { type: 'radio', value: 'event', label: 'Event', isChecked: false, isDisabled: points.length === 0 },
      { type: 'radio', value: 'time', label: 'Time', isChecked: false, isDisabled: points.length === 0 },
      { type: 'radio', value: 'price', label: 'Price', isChecked: false, isDisabled: points.length === 0 },
      { type: 'span', value: 'offer', label: 'Offers' }
    ];
    this._sortComponent = new Sort(sortTypes);
    render(this._sortComponent, this._eventsContainer, RenderPosition.AFTERBEGIN);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);

    if (points.length === 0) {
      const emptyView = new TripEmpty();
      render(emptyView, this._eventsListContainer);
    } else {
      this._renderPoints();
    }
  }

  _getSortedPoints() {
    const points = [...this._model.getPoints()];
    switch (this._currentSortType) {
      case 'day':
        return points.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      case 'time':
        return points.sort((a, b) => (new Date(b.endTime) - new Date(b.startTime)) - (new Date(a.endTime) - new Date(a.startTime)));
      case 'price':
        return points.sort((a, b) => b.price - a.price);
      default:
        return points;
    }
  }

  _clearPoints() {
    this._pointPresenters.forEach((presenter) => presenter.destroy());
    this._pointPresenters = [];
  }

  _renderPoints() {
    for (const point of this._getSortedPoints()) {
      const presenter = new PointPresenter(
        this._eventsListContainer,
        this._handleDataChange,
        this._handleModeChange
      );
      presenter.init(point);
      this._pointPresenters.push(presenter);
    }
  }

  _handleSortTypeChange = (sortType) => {
    if (sortType === this._currentSortType) {
      return;
    }
    this._currentSortType = sortType;
    this._clearPoints();
    this._renderPoints();
  };

  _handleDataChange = (updatedPoint) => {
    const point = this._getSortedPoints();
    const index = point.findIndex((p) => p.id === updatedPoint.id);
    if (index === -1) {
      return;
    }
    this._model.updatePoint(updatedPoint);
    this._pointPresenters[index].init(updatedPoint);
  };

  _handleModeChange = () => {
    this._pointPresenters.forEach((presenter) => presenter.resetView());
  };
}
