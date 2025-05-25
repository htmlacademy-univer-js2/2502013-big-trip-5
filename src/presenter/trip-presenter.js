import {render, RenderPosition} from '../render.js';
import Sort from '../view/sort.js';
import TripEmpty from '../view/trip-empty.js';
import LoadingView from '../view/loading.js';
import ErrorView from '../view/error.js';
import PointPresenter from './point-presenter.js';
import {FilterType, UPDATE_TYPE} from '../model/filter-model.js';
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
  #loadingComponent = null;
  #errorComponent = null;
  #newPointPresenter = null;

  constructor(model, filterModel, eventsContainer, eventsListContainer) {
    this.#model = model;
    this.#filterModel = filterModel;
    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#model.addObserver(this.#handleModelEvent);
    this.#eventsContainer = eventsContainer;
    this.#eventsListContainer = eventsListContainer;
  }

  init() {
    this.#renderBoard();
  }

  #renderBoard() {
    if (this.#model.loadingState === 'LOADING') {
      this.#renderLoading();
    } else if (this.#model.loadingState === 'ERROR') {
      this.#renderError();
    } else {
      this.#renderContent();
    }
  }

  #renderLoading() {
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.#eventsListContainer);
  }

  #renderError() {
    this.#errorComponent = new ErrorView();
    render(this.#errorComponent, this.#eventsListContainer);
  }

  #renderContent() {
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
        this.#handleModeChange,
        this.#model.getDestinations(),
        this.#model.getOffers()
      );
      presenter.init(point);
      this.#pointPresenters.push(presenter);
    }
  }

  handleNewPointFormOpen = () => {
    if (this.#newPointPresenter || this.#model.loadingState !== 'SUCCESS') {
      return;
    }
    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }
    this.#currentSortType = 'day';
    this.#filterModel.setFilter(UPDATE_TYPE.FILTER, FilterType.EVERYTHING);
    this.#handleModeChange();
    this.#newPointPresenter = new PointPresenter(
      this.#eventsListContainer,
      this.#handleDataChange,
      this.#handleNewPointFormClose,
      this.#model.getDestinations(),
      this.#model.getOffers()
    );
    this.#newPointPresenter.init(
      {
        type: EVENT_TYPES[0].type,
        destination: '',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        price: 0,
        isFavorite: false,
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

  #handleDataChange = async (type, updatedPoint) => {
    try {
      switch (type) {
        case USER_ACTION.ADD_POINT:
          await this.#model.addPoint(updatedPoint);
          this.#newPointPresenter.destroy();
          this.#newPointPresenter = null;
          break;
        case USER_ACTION.UPDATE_POINT:
          await this.#model.updatePoint(updatedPoint);
          break;
        case USER_ACTION.DELETE_POINT:
          await this.#model.deletePoint(updatedPoint.id);
          break;
        default:
      }
    } catch (err) {
      if (type === USER_ACTION.ADD_POINT && this.#newPointPresenter) {
        this.#newPointPresenter.resetFormState();
      } else {
        const pointPresenter = this.#pointPresenters.find(
          (p) => p.getPointId() === updatedPoint.id
        );
        if (pointPresenter) {
          pointPresenter.resetFormState();
        }
      }
    }
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#newPointPresenter?.destroy();
    this.#newPointPresenter = null;
  };

  #handleModelEvent = (updateType) => {
    if (updateType === UPDATE_TYPE.FILTER) {
      this.#currentSortType = 'day';
      this.#renderBoard();
    } else if (updateType === UPDATE_TYPE.LOADING) {
      this.#clearBoard();
      this.#renderLoading();
    } else if (updateType === UPDATE_TYPE.ERROR) {
      this.#clearBoard();
      this.#renderError();
    } else if (updateType === UPDATE_TYPE.INIT) {
      this.#clearBoard();
      this.#renderContent();
    } else {
      this.#renderBoard();
    }
  };

  #clearBoard() {
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }
    if (this.#errorComponent) {
      remove(this.#errorComponent);
      this.#errorComponent = null;
    }
    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }
    this.#clearPoints();
  }
}
