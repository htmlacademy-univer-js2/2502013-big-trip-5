import {render, RenderPosition} from '../render.js';
import Sort from '../view/sort.js';
import TripEmpty from '../view/trip-empty.js';
import PointPresenter from './point-presenter.js';
import {FilterType, UpdateType} from '../model/filter-model.js';
import {remove} from '../framework/render';
import {EVENT_TYPES, USER_ACTION} from '../const';

export default class TripPresenter {
  #model = null;
  #filterModel = null;
  #pointPresenters = [];
  #currentSortType = 'day';
  #sortComponent = null;
  #eventsContainer = null;
  #eventsListContainer = null;
  #emptyComponent = null;
  #newPointPresenter = null;

  constructor(model, filterModel, eventsContainer, eventsListContainer) {
    this.#model = model;
    this.#filterModel = filterModel;
    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#eventsContainer = eventsContainer;
    this.#eventsListContainer = eventsListContainer;
  }

  init() {
    this.#renderBoard();
  }

  #renderBoard() {
    if (this.#sortComponent) {
      remove(this.#sortComponent);
    }
    this.#sortComponent = new Sort([
      { type: 'radio', value: 'day', label: 'Day', isChecked: this.#currentSortType === 'day' },
      { type: 'radio', value: 'event', label: 'Event', isChecked: this.#currentSortType === 'event' },
      { type: 'radio', value: 'time', label: 'Time', isChecked: this.#currentSortType === 'time' },
      { type: 'radio', value: 'price', label: 'Price', isChecked: this.#currentSortType === 'price'},
      { type: 'span', value: 'offer', label: 'Offers' }
    ]);
    render(this.#sortComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);
    this.#clearPoints();
    this.#renderPoints();
  }

  #getFilteredPoints() {
    const allPoints = [...this.#model.getPoints()];
    const filterType = this.#filterModel.getFilter();
    let points;
    switch (filterType) {
      case FilterType.FUTURE:
        points = allPoints.filter((p) => new Date(p.startTime) > Date.now());
        break;
      case FilterType.PRESENT:
        points = allPoints.filter((p) => new Date(p.startTime) <= Date.now() && new Date(p.endTime) >= Date.now());
        break;
      case FilterType.PAST:
        points = allPoints.filter((p) => new Date(p.endTime) < Date.now());
        break;
      default:
        points = allPoints;
    }
    switch (this.#currentSortType) {
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

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters = [];
    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }
  }

  #renderPoints() {
    const points = this.#getFilteredPoints();
    if (points.length === 0 && !this.#newPointPresenter) {
      this.#emptyComponent = new TripEmpty(this.#filterModel.getFilter());
      render(this.#emptyComponent, this.#eventsListContainer);
      return;
    }
    for (const point of this.#getFilteredPoints()) {
      const presenter = new PointPresenter(
        this.#eventsListContainer,
        this.#handleDataChange,
        this.#handleModeChange
      );
      presenter.init(point);
      this.#pointPresenters.push(presenter);
    }
  }

  handleNewPointFormOpen = () => {
    if (this.#newPointPresenter) {
      return;
    }
    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }
    this.#currentSortType = 'day';
    this.#filterModel.setFilter(UpdateType.FILTER, FilterType.EVERYTHING);

    this.#newPointPresenter = new PointPresenter(
      this.#eventsListContainer,
      this.#handleDataChange,
      this.#handleNewPointFormClose
    );
    this.#newPointPresenter.init(
      {
        type: EVENT_TYPES[0].type,
        price: 0,
        offers: [],
      }, true
    );
  };

  #handleNewPointFormClose = () => {
    this.#newPointPresenter?.destroy();
    this.#newPointPresenter = null;
    const points = this.#getFilteredPoints();
    if (points.length === 0) {
      this.#emptyComponent = new TripEmpty(this.#filterModel.getFilter());
      render(this.#emptyComponent, this.#eventsListContainer);
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (sortType === this.#currentSortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#renderBoard();
  };

  #handleDataChange = (type, updatedPoint) => {
    switch (type) {
      case USER_ACTION.ADD_POINT:
        this.#newPointPresenter.destroy();
        this.#newPointPresenter = null;
        this.#model.addPoint(updatedPoint);
        break;
      case USER_ACTION.UPDATE_POINT:
        this.#model.updatePoint(updatedPoint);
        break;
      case USER_ACTION.DELETE_POINT:
        this.#model.deletePoint(updatedPoint.id);
        break;
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
    this.#clearPoints();
    this.#renderBoard();
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#newPointPresenter?.destroy();
    this.#newPointPresenter = null;
  };

  #handleModelEvent = (updateType) => {
    if (updateType === UpdateType.FILTER) {
      this.#currentSortType = 'day';
      this.#renderBoard();
    }
  };
}
