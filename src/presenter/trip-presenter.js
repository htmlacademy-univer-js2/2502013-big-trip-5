import { render, RenderPosition } from '../render.js';
import Filters from '../view/filters.js';
import Sort from '../view/sort.js';
import TripFormCreate from '../view/trip-form-create.js';
import TripFormEdit from '../view/trip-form-edit.js';
import TripPoint from '../view/trip-point.js';
import TripModel from '../model/trip-model.js';
import {replace} from '../framework/render';

export default class TripPresenter {
  init() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    const filtersComponent = new Filters();
    render(filtersComponent, filtersContainer);

    const eventsListContainer = document.querySelector('.trip-events__list');
    const eventsContainer = document.querySelector('.trip-events');

    const sortComponent = new Sort();
    render(sortComponent, eventsContainer, RenderPosition.AFTERBEGIN);

    const model = new TripModel();
    const points = model.getPoints();

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

    const createFormComponent = new TripFormCreate();
    render(createFormComponent, eventsListContainer);
  }
}
