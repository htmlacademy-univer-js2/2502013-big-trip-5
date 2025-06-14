import FilterModel, {UpdateType} from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import TripModel from './model/trip-model.js';
import TripApiService from './api/trip-api-service.js';
import { API_BASE_URL, API_AUTHORIZATION } from './const.js';

const eventsContainer = document.querySelector('.trip-events');
const eventsListContainer = document.querySelector('.trip-events__list');
const createEventButton = document.querySelector('.trip-main__event-add-btn');

const apiService = new TripApiService(API_BASE_URL, API_AUTHORIZATION);
const tripModel = new TripModel(apiService);
const filterModel = new FilterModel();

createEventButton.disabled = true;

const filterContainer = document.querySelector('.trip-controls__filters');
const filterPresenter = new FilterPresenter(filterContainer, filterModel, tripModel);
filterPresenter.init();

const tripMainElement = document.querySelector('.trip-main');
const tripInfoPresenter = new TripInfoPresenter(tripMainElement, tripModel);
tripInfoPresenter.init();

const tripPresenter = new TripPresenter(tripModel, filterModel, eventsContainer, eventsListContainer, createEventButton);

createEventButton.addEventListener('click', (e) => {
  e.preventDefault();
  tripPresenter.onNewPointFormOpenHandler();
});

tripModel.addObserver((updateType) => {
  if (updateType === UpdateType.INIT) {
    createEventButton.disabled = false;
  } else if (updateType === UpdateType.ERROR) {
    createEventButton.disabled = true;
  }
});

tripPresenter.init();
tripModel.init();
