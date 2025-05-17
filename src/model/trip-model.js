import { generateTripPoints } from '../mock/trip-data.js';

export default class TripModel {
  constructor() {
    this._points = generateTripPoints();
  }

  getPoints() {
    return this._points;
  }

  updatePoint(point) {
    const index = this._points.findIndex((p) => p.id === point.id);
    if (index !== -1) {
      this._points[index] = point;
    }
  }
}
