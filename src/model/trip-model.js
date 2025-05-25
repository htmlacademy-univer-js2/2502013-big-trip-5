import Observable from '../framework/observable.js';
import { adaptPointToClient, adaptDestinationToClient, adaptOfferToClient } from '../adapter/data-adapter.js';

const LoadingState = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

export default class TripModel extends Observable {
  #points = [];
  #destinations = [];
  #offers = [];
  #apiService = null;
  #loadingState = LoadingState.LOADING;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get loadingState() {
    return this.#loadingState;
  }

  async init() {
    try {
      this.#loadingState = LoadingState.LOADING;
      this._notify('loading');

      const [points, destinations, offers] = await Promise.all([
        this.#apiService.getPoints(),
        this.#apiService.getDestinations(),
        this.#apiService.getOffers(),
      ]);

      this.#points = points.map(adaptPointToClient);
      this.#destinations = destinations.map(adaptDestinationToClient);
      this.#offers = offers.map(adaptOfferToClient);

      this.#loadingState = LoadingState.SUCCESS;
      this._notify('init');
    } catch (err) {
      this.#loadingState = LoadingState.ERROR;
      this._notify('error');
      throw err;
    }
  }

  getPoints() {
    return this.#points;
  }

  getDestinations() {
    return this.#destinations;
  }

  getOffers() {
    return this.#offers;
  }

  async updatePoint(point) {
    try {
      const updatedPoint = await this.#apiService.updatePoint(point);
      const adaptedPoint = adaptPointToClient(updatedPoint);

      const index = this.#points.findIndex((p) => p.id === point.id);
      if (index !== -1) {
        this.#points[index] = adaptedPoint;
      }
      this._notify('update', this.#points);
      return adaptedPoint;
    } catch (err) {
      throw new Error('Failed to update point');
    }
  }

  async addPoint(point) {
    try {
      const newPoint = await this.#apiService.addPoint(point);
      const adaptedPoint = adaptPointToClient(newPoint);

      this.#points.push(adaptedPoint);
      this._notify('update', this.#points);
      return adaptedPoint;
    } catch (err) {
      throw new Error('Failed to add point');
    }
  }

  async deletePoint(pointId) {
    try {
      await this.#apiService.deletePoint({ id: pointId });
      this.#points = this.#points.filter((p) => p.id !== pointId);
      this._notify('update', this.#points);
    } catch (err) {
      throw new Error('Failed to delete point');
    }
  }

  setPoints(points) {
    this.#points = points;
  }
}
