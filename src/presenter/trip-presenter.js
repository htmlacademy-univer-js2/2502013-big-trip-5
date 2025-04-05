import { render, RenderPosition } from '../render.js';
import Filters from '../view/filters.js';
import Sort from '../view/sort.js';
import TripFormCreate from '../view/trip-form-create.js';
import TripFormEdit from '../view/trip-form-edit.js';
import TripPoint from '../view/trip-point.js';
import TripModel from '../model/trip-model.js';

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

    if (points.length) {
      const editFormComponent = new TripFormEdit(points[0]);
      render(editFormComponent, eventsListContainer, RenderPosition.AFTERBEGIN);
    }

    points.forEach((pointData) => {
      const tripPointComponent = new TripPoint(pointData);
      render(tripPointComponent, eventsListContainer);
    });

    const createFormComponent = new TripFormCreate();
    render(createFormComponent, eventsListContainer);
  }
}
