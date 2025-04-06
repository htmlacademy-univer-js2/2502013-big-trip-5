import { render, RenderPosition } from '../render.js';
import Filters from '../view/filters.js';
import Sort from '../view/sort.js';
import TripFormEdit from '../view/trip-form-edit.js';
import TripPoint from '../view/trip-point.js';
import { replace } from '../framework/render';
import TripEmpty from '../view/trip-empty.js';

export default class TripPresenter {
  constructor(model) {
    this._model = model;
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
        const tripPointComponent = new TripPoint(pointData);
        const tripFormEditComponent = new TripFormEdit(pointData);

        let onEscKeyDown = null;
        const replaceEditToPoint = () => {
          replace(tripPointComponent, tripFormEditComponent);
          document.removeEventListener('keydown', onEscKeyDown);
        };

        const replacePointToEdit = () => {
          replace(tripFormEditComponent, tripPointComponent);
          document.addEventListener('keydown', onEscKeyDown);
        };

        onEscKeyDown = (evt) => {
          if (evt.key === 'Escape' || evt.key === 'Esc') {
            evt.preventDefault();
            replaceEditToPoint();
          }
        };

        tripPointComponent.setEditClickHandler(replacePointToEdit);
        tripFormEditComponent.setFormSubmitHandler((evt) => {
          evt.preventDefault();
          replaceEditToPoint();
        });
        tripFormEditComponent.setCancelClickHandler(replaceEditToPoint);

        render(tripPointComponent, eventsListContainer);
      });
    }
  }
}
