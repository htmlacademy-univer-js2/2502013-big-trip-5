import {render, RenderPosition} from '../render.js';
import TripInfoView from '../view/trip-info-view.js';
import {remove} from '../framework/render';

export default class TripInfoPresenter {
  #container = null;
  #pointsModel = null;
  #tripInfoComponent = null;

  constructor(container, pointsModel) {
    this.#container = container;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#onModelEventHandler);
  }

  init() {
    this.#renderTripInfo();
  }

  #renderTripInfo() {
    const points = this.#pointsModel.getPoints();

    if (points.length === 0) {
      if (this.#tripInfoComponent) {
        remove(this.#tripInfoComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    if (this.#tripInfoComponent) {
      remove(this.#tripInfoComponent);
    }

    this.#tripInfoComponent = new TripInfoView(
      points,
      this.#pointsModel.getDestinations(),
      this.#pointsModel.getOffers()
    );

    render(this.#tripInfoComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #onModelEventHandler = () => {
    this.#renderTripInfo();
  };
}
