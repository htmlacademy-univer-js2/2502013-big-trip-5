import { generateTripPoints } from '../mock/trip-data.js';

export default class TripModel {
  constructor() {
    this._points = generateTripPoints();
  }

  getPoints() {
    return this._points;
  }
}
