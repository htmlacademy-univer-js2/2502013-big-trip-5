import { generateTripPoints } from '../mock/trip-data.js';
import Observable from '../framework/observable.js';

export default class TripModel extends Observable {
  #points = [];
  constructor() {
    super();
    this.#points = generateTripPoints();
  }

  getPoints() {
    return this.#points;
  }

  updatePoint(point) {
    const index = this.#points.findIndex((p) => p.id === point.id);
    if (index !== -1) {
      this.#points[index] = point;
    }
  }

  addPoint(point) {
    this.#points.push(point);
    this._notify('update', this.#points);
  }

  deletePoint(pointId) {
    this.#points = this.#points.filter((p) => p.id !== pointId);
    this._notify('update', this.#points);
  }

  setPoints(points) {
    this.#points = points;
  }
}
