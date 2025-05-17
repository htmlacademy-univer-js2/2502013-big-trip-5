import { render } from '../render.js';
import TripPointView from '../view/trip-point.js';
import TripFormEditView from '../view/trip-form-edit.js';
import {remove, replace} from '../framework/render';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  constructor(container, changeData, changeMode) {
    this._container = container;
    this._changeData = changeData;
    this._changeMode = changeMode;

    this._point = null;
    this._pointComponent = null;
    this._editComponent = null;
    this._mode = Mode.DEFAULT;
  }

  init(point) {
    this._point = point;

    const prevPointComponent = this._pointComponent;
    const prevEditComponent = this._editComponent;

    this._pointComponent = new TripPointView(this._point);
    this._editComponent = new TripFormEditView(this._point);

    this._pointComponent.setEditClickHandler(this._handleEditClick);
    this._pointComponent.setFavoriteClickHandler(this._handleFavoriteClick);
    this._editComponent.setFormSubmitHandler(this._handleFormSubmit);
    this._editComponent.setCancelClickHandler(this._handleCancelClick);

    if (prevPointComponent === null) {
      render(this._pointComponent, this._container);
    } else if (this._mode === Mode.DEFAULT) {
      replace(this._pointComponent, prevPointComponent);
    } else {
      this._mode = Mode.DEFAULT;
      replace(this._pointComponent, prevEditComponent);
    }
  }

  _handleEditClick = () => {
    this._changeMode();
    replace(this._editComponent, this._pointComponent);
    document.addEventListener('keydown', this._escKeyDownHandler);
    this._mode = Mode.EDITING;
  };

  _handleCancelClick = () => {
    replace(this._pointComponent, this._editComponent);
    document.removeEventListener('keydown', this._escKeyDownHandler);
    this._mode = Mode.DEFAULT;
  };

  _handleFormSubmit = (updatedPoint) => {
    this._changeData(updatedPoint);
    this._handleCancelClick();
  };

  _handleFavoriteClick = () => {
    this._changeData({ ...this._point, isFavorite: !this._point.isFavorite });
  };

  _escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this._handleCancelClick();
    }
  };

  resetView = () => {
    if (this._mode !== Mode.DEFAULT) {
      this._handleCancelClick();
    }
  };

  destroy() {
    remove(this._pointComponent);
    remove(this._editComponent);
  }
}
