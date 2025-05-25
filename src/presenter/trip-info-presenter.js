import {render, RenderPosition} from '../render.js';
import TripInfoView from '../view/trip-info.js';
import {remove} from '../framework/render';

export default class TripInfoPresenter {
  #container = null;
  #pointsModel = null;
  #tripInfoComponent = null;

  constructor(container, pointsModel) {
    this.#container = container;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    this.#renderTripInfo();
  }

  #renderTripInfo() {
    if (this.#tripInfoComponent) {
      remove(this.#tripInfoComponent);
    }

    this.#tripInfoComponent = new TripInfoView(
      this.#pointsModel.getPoints(),
      this.#pointsModel.getDestinations(),
      this.#pointsModel.getOffers()
    );

    render(this.#tripInfoComponent, this.#container, RenderPosition.AFTERBEGIN);
  }

  #handleModelEvent = () => {
    this.#renderTripInfo();
  };
}
