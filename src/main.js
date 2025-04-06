import TripPresenter from './presenter/trip-presenter.js';
import TripModel from './model/trip-model';

const tripModel = new TripModel();
const tripPresenter = new TripPresenter(tripModel);
tripPresenter.init();
