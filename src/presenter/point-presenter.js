import {render, RenderPosition} from '../render.js';
import TripPointView from '../view/trip-point-view.js';
import TripFormEditView from '../view/trip-form-view.js';
import {remove, replace} from '../framework/render';
import { UserAction } from '../const.js';

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
  #destinations = [];
  #offers = [];

  constructor(container, changeData, changeMode, destinations = [], offers = []) {
    this.#container = container;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  init(point, isNewPoint = false) {
    this.#point = point;
    this.#isNewPoint = isNewPoint;

    const prevEditComponent = this.#editComponent;
    this.#editComponent = new TripFormEditView(this.#point, this.#destinations, this.#offers, this.#isNewPoint);
    this.#editComponent.setFormSubmitHandler(this.#onFormSubmitHandler);
    this.#editComponent.setCancelClickHandler(this.#onCancelClickHandler);
    this.#editComponent.setDeleteClickHandler(this.#onDeleteClickHandler);
    this.#mode = this.#isNewPoint ? Mode.EDITING : Mode.DEFAULT;

    if (!this.#isNewPoint) {
      const prevPointComponent = this.#pointComponent;
      this.#pointComponent = new TripPointView(this.#point, this.#destinations, this.#offers);
      this.#pointComponent.setEditClickHandler(this.#onEditClickHandler);
      this.#pointComponent.setFavoriteClickHandler(this.#onFavoriteClickHandler);
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
      document.addEventListener('keydown', this.#onEscKeyDownHandler);
    }
  }

  getView() {
    return this.#mode === Mode.EDITING ? this.#editComponent : this.#pointComponent;
  }

  getPointId() {
    return this.#point?.id;
  }

  resetView = () => {
    if (this.#mode === Mode.EDITING) {
      this.#onCancelClickHandler();
    }
  };

  resetFormState() {
    if (this.#mode === Mode.EDITING && this.#editComponent) {
      this.#editComponent.setFormState({isDisabled: false, isSaving: false, isDeleting: false});
    }
  }

  destroy() {
    if (this.#mode === Mode.EDITING) {
      document.removeEventListener('keydown', this.#onEscKeyDownHandler);
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

  #onEditClickHandler = () => {
    this.#changeMode();
    replace(this.#editComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#onEscKeyDownHandler);
    this.#mode = Mode.EDITING;
  };

  #onCancelClickHandler = () => {
    if (this.#isNewPoint) {
      this.#changeMode();
      return;
    }
    this.#editComponent.reset(this.#point);
    replace(this.#pointComponent, this.#editComponent);
    document.removeEventListener('keydown', this.#onEscKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  };

  #onFormSubmitHandler = (updatedPoint) => {
    this.#editComponent.setFormState({isDisabled: true, isSaving: true});
    this.#changeData(this.#isNewPoint ? UserAction.ADD_POINT : UserAction.UPDATE_POINT, updatedPoint);
  };

  #onFavoriteClickHandler = () => {
    this.#changeData(UserAction.UPDATE_POINT, { ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #onDeleteClickHandler = () => {
    if (this.#isNewPoint) {
      this.#changeMode();
      return;
    }
    this.#editComponent.setFormState({isDisabled: true, isDeleting: true});
    this.#changeData(UserAction.DELETE_POINT, this.#point);
  };

  #onEscKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#onCancelClickHandler();
    }
  };
}
