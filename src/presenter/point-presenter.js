import {render, RenderPosition} from '../render.js';
import TripPointView from '../view/trip-point.js';
import TripFormEditView from '../view/trip-form-edit.js';
import {remove, replace} from '../framework/render';
import { USER_ACTION } from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #pointComponent = null;
  #editComponent = null;
  #point = null;
  #container = null;
  #changeData = null;
  #changeMode = null;
  #mode = null;
  #isNewPoint = false;

  constructor(container, changeData, changeMode) {
    this.#container = container;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
  }

  init(point, isNewPoint = false) {
    this.#point = point;
    this.#isNewPoint = isNewPoint;

    const prevEditComponent = this.#editComponent;
    this.#editComponent = new TripFormEditView(this.#point);
    this.#editComponent.setFormSubmitHandler(this.#handleFormSubmit);
    this.#editComponent.setCancelClickHandler(this.#handleCancelClick);
    this.#editComponent.setDeleteClickHandler(this.#handleDeleteClick);
    this.#mode = this.#isNewPoint ? Mode.EDITING : Mode.DEFAULT;

    if (!this.#isNewPoint) {
      const prevPointComponent = this.#pointComponent;
      this.#pointComponent = new TripPointView(this.#point);
      this.#pointComponent.setEditClickHandler(this.#handleEditClick);
      this.#pointComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
      if (prevPointComponent === null) {
        render(this.#pointComponent, this.#container);
      } else if (this.#mode === Mode.DEFAULT) {
        replace(this.#pointComponent, prevPointComponent);
      } else {
        this.#mode = Mode.DEFAULT;
        replace(this.#pointComponent, prevEditComponent);
      }
    } else {
      render(this.#editComponent, this.#container, RenderPosition.AFTERBEGIN);
    }
  }

  #handleEditClick = () => {
    this.#changeMode();
    replace(this.#editComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.EDITING;
  };

  #handleCancelClick = () => {
    if (this.#isNewPoint) {
      this.#changeMode();
      return;
    }
    replace(this.#pointComponent, this.#editComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  };

  #handleFormSubmit = (updatedPoint) => {
    this.#changeData(this.#isNewPoint ? USER_ACTION.ADD_POINT : USER_ACTION.UPDATE_POINT, updatedPoint);
  };

  #handleFavoriteClick = () => {
    this.#changeData(USER_ACTION.UPDATE_POINT, { ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #handleDeleteClick = () => {
    if (this.#isNewPoint) {
      this.#changeMode();
      return;
    }
    this.#changeData(USER_ACTION.DELETE_POINT, this.#point);
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#handleCancelClick();
    }
  };

  resetView = () => {
    if (this.#mode === Mode.EDITING) {
      this.#handleCancelClick();
    }
  };

  destroy() {
    if (this.#mode === Mode.EDITING) {
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
    if (this.#pointComponent) {
      remove(this.#pointComponent);
      this.#pointComponent = null;
    }
    if (this.#editComponent) {
      remove(this.#editComponent);
      this.#editComponent = null;
    }
  }
}
