import {render, RenderPosition} from '../render.js';
import SortView from '../view/sort-view.js';
import TripEmptyView from '../view/trip-empty-view.js';
import LoadingView from '../view/loading-view.js';
import ErrorView from '../view/error-view.js';
import PointPresenter from './point-presenter.js';
import {FilterType, UpdateType} from '../model/filter-model.js';
import {remove} from '../framework/render';
import {EventTypes, UserAction} from '../const';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import {LoadingState} from '../model/trip-model';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price',
};

export default class TripPresenter {
  #model = null;
  #filterModel = null;
  #pointPresenters = [];
  #currentSortType = SortType.DAY;
  #sortComponent = null;
  #eventsContainer = null;
  #eventsListContainer = null;
  #emptyComponent = null;
  #loadingComponent = null;
  #errorComponent = null;
  #newPointPresenter = null;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  #createEventButton = null;

  constructor(model, filterModel, eventsContainer, eventsListContainer, createEventButton) {
    this.#model = model;
    this.#filterModel = filterModel;
    this.#eventsContainer = eventsContainer;
    this.#eventsListContainer = eventsListContainer;
    this.#createEventButton = createEventButton;

    this.#filterModel.addObserver(this.#onModelEventHandler);
    this.#model.addObserver(this.#onModelEventHandler);
  }

  init() {
    this.#renderBoard();
  }

  onNewPointFormOpenHandler = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    if (this.#newPointPresenter || this.#model.loadingState !== LoadingState.SUCCESS) {
      return;
    }
    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.FILTER, FilterType.EVERYTHING);
    this.#createEventButton.disabled = true;
    this.#newPointPresenter = new PointPresenter(
      this.#eventsListContainer,
      this.#onDataChangeHandler,
      this.#onNewPointFormCloseHandler,
      this.#model.getDestinations(),
      this.#model.getOffers()
    );
    this.#newPointPresenter.init(
      {
        type: EventTypes[0].type,
        destination: '',
        startTime: null,
        endTime: null,
        price: 0,
        isFavorite: false,
        offers: [],
      }, true
    );
  };

  #renderBoard() {
    if (this.#model.loadingState === LoadingState.LOADING) {
      this.#renderLoading();
    } else if (this.#model.loadingState === LoadingState.ERROR) {
      this.#renderError();
    } else {
      this.#renderContent();
    }
  }

  #renderLoading() {
    this.#clearBoard({keepSort: true});
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.#eventsListContainer);
  }

  #renderError() {
    this.#clearBoard({keepSort: true});
    this.#errorComponent = new ErrorView();
    render(this.#errorComponent, this.#eventsListContainer);
  }

  #renderContent() {
    const currentSortComponent = this.#sortComponent;
    if (currentSortComponent) {
      remove(currentSortComponent);
    }
    this.#sortComponent = new SortView([
      { type: 'radio', value: SortType.DAY, label: 'Day', isChecked: this.#currentSortType === SortType.DAY },
      { type: 'radio', value: 'event', label: 'Event', isChecked: this.#currentSortType === 'event' },
      { type: 'radio', value: SortType.TIME, label: 'Time', isChecked: this.#currentSortType === SortType.TIME },
      { type: 'radio', value: SortType.PRICE, label: 'Price', isChecked: this.#currentSortType === SortType.PRICE},
      { type: 'span', value: 'offer', label: 'Offers' }
    ]);
    render(this.#sortComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
    this.#sortComponent.setSortTypeChangeHandler(this.#onSortTypeChangeHandler);
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
      case SortType.DAY:
        return points.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      case SortType.TIME:
        return points.sort((a, b) => (new Date(b.endTime) - new Date(b.startTime)) - (new Date(a.endTime) - new Date(a.startTime)));
      case SortType.PRICE:
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
      this.#emptyComponent = new TripEmptyView(this.#filterModel.getFilter());
      render(this.#emptyComponent, this.#eventsListContainer);
      return;
    }
    for (const point of points) {
      const presenter = new PointPresenter(
        this.#eventsListContainer,
        this.#onDataChangeHandler,
        this.#onModeChangeHandler,
        this.#model.getDestinations(),
        this.#model.getOffers()
      );
      presenter.init(point);
      this.#pointPresenters.push(presenter);
    }
  }

  #clearBoard({keepSort = false} = {}) {
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }
    this.#clearPoints();

    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }
    if (this.#errorComponent) {
      remove(this.#errorComponent);
      this.#errorComponent = null;
    }
    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }
    if (!keepSort && this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }
  }

  #onNewPointFormCloseHandler = () => {
    this.#newPointPresenter?.destroy();
    this.#newPointPresenter = null;
    this.#createEventButton.disabled = this.#model.loadingState === LoadingState.ERROR;
    const points = this.#getFilteredPoints();
    if (points.length === 0) {
      this.#emptyComponent = new TripEmptyView(this.#filterModel.getFilter());
      render(this.#emptyComponent, this.#eventsListContainer);
    }
  };

  #onSortTypeChangeHandler = (sortType) => {
    if (sortType === this.#currentSortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearPoints();
    this.#renderPoints();
  };

  #onDataChangeHandler = async (type, updatedPoint) => {
    this.#uiBlocker.block();
    try {
      switch (type) {
        case UserAction.ADD_POINT:
          await this.#model.addPoint(updatedPoint);
          this.#newPointPresenter.destroy();
          this.#newPointPresenter = null;
          break;
        case UserAction.UPDATE_POINT:
          await this.#model.updatePoint(updatedPoint);
          break;
        case UserAction.DELETE_POINT:
          await this.#model.deletePoint(updatedPoint.id);
          break;
        default:
      }
    } catch (err) {
      if (type === UserAction.ADD_POINT && this.#newPointPresenter) {
        this.#newPointPresenter.resetFormState();
        this.#newPointPresenter.getView()?.shake();
      } else {
        const pointPresenter = this.#pointPresenters.find(
          (p) => p.getPointId() === updatedPoint.id
        );
        if (pointPresenter) {
          pointPresenter.resetFormState();
          pointPresenter.getView()?.shake();
        }
      }
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #onModeChangeHandler = () => {
    if (this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
      this.#createEventButton.disabled = this.#model.loadingState === LoadingState.ERROR;
    }
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #onModelEventHandler = (updateType) => {
    switch (updateType) {
      case UpdateType.FILTER:
        this.#onModeChangeHandler();
        this.#currentSortType = SortType.DAY;
        this.#clearBoard();
        this.#renderContent();
        break;
      case UpdateType.LOADING:
        this.#clearBoard();
        this.#renderLoading();
        break;
      case UpdateType.ERROR:
        this.#clearBoard();
        this.#renderError();
        this.#createEventButton.disabled = true;
        break;
      case UpdateType.INIT:
        this.#clearBoard();
        this.#renderContent();
        this.#createEventButton.disabled = false;
        break;
      case UpdateType.UPDATE:
        this.#onModeChangeHandler();
        this.#clearBoard();
        this.#renderContent();
        break;
      default:
        this.#clearBoard();
        this.#renderContent();
    }
  };
}
