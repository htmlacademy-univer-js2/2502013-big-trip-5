import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import TripModel from './model/trip-model.js';


const eventsContainer = document.querySelector('.trip-events');
const eventsListContainer = document.querySelector('.trip-events__list');
const tripModel = new TripModel();
const filterModel = new FilterModel();

const filterContainer = document.querySelector('.trip-controls__filters');
const filterPresenter = new FilterPresenter(filterContainer, filterModel);
filterPresenter.init();

const createEventButton = document.querySelector('.trip-main__event-add-btn');
const tripPresenter = new TripPresenter(tripModel, filterModel, eventsContainer, eventsListContainer);
createEventButton.addEventListener('click', (e) => {
  e.preventDefault();
  tripPresenter.handleNewPointFormOpen();
});
tripPresenter.init();
