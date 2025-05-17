import { render, RenderPosition } from '../render.js';
import Filters from '../view/filters.js';
import Sort from '../view/sort.js';
import TripEmpty from '../view/trip-empty.js';
import PointPresenter from './point-presenter.js';

export default class TripPresenter {
  constructor(model) {
    this._model = model;
    this._pointPresenters = [];
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

    const eventsListContainer = document.querySelector('.trip-events__list');
    const eventsContainer = document.querySelector('.trip-events');

    const sortTypes = [
      { type: 'radio', value: 'day', label: 'Day', isChecked: true, isDisabled: points.length === 0 },
      { type: 'radio', value: 'event', label: 'Event', isChecked: false, isDisabled: points.length === 0 },
      { type: 'radio', value: 'time', label: 'Time', isChecked: false, isDisabled: points.length === 0 },
      { type: 'radio', value: 'price', label: 'Price', isChecked: false, isDisabled: points.length === 0 },
      { type: 'span', value: 'offer', label: 'Offers' }
    ];
    const sortComponent = new Sort(sortTypes);
    render(sortComponent, eventsContainer, RenderPosition.AFTERBEGIN);

    if (points.length === 0) {
      const emptyView = new TripEmpty();
      render(emptyView, eventsListContainer);
    } else {
      points.forEach((pointData) => {
        const presenter = new PointPresenter(
          eventsListContainer,
          this._handleDataChange,
          this._handleModeChange
        );
        presenter.init(pointData);
        this._pointPresenters.push(presenter);
      });
    }
  }

  _handleDataChange = (updatedPoint) => {
    const points = this._model.getPoints();
    const index = points.findIndex((point) => point.id === updatedPoint.id);
    if (index === -1) {
      return;
    }
    points[index] = updatedPoint;
    this._pointPresenters[index].init(updatedPoint);
  };

  _handleModeChange = () => {
    this._pointPresenters.forEach((presenter) => presenter.resetView());
  };
}
