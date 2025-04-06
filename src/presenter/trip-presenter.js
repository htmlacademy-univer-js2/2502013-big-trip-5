import { render, RenderPosition } from '../render.js';
import Filters from '../view/filters.js';
import Sort from '../view/sort.js';
import TripFormEdit from '../view/trip-form-edit.js';
import TripPoint from '../view/trip-point.js';
import {replace} from '../framework/render';
import TripEmpty from '../view/trip-empty.js';

export default class TripPresenter {
  constructor(model) {
    this._model = model;
  }

  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    const filtersComponent = new Filters();
    render(filtersComponent, filtersContainer);

    const eventsListContainer = document.querySelector('.trip-events__list');
    const eventsContainer = document.querySelector('.trip-events');

    const sortComponent = new Sort();
    render(sortComponent, eventsContainer, RenderPosition.AFTERBEGIN);

    if (this._model.getPoints().length === 0) {
      const emptyView = new TripEmpty();
      render(emptyView, eventsListContainer);
    } else {
      this._model.getPoints().forEach((pointData) => {
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
