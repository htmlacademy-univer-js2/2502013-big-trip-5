import AbstractView from '../framework/view/abstract-view';
import dayjs from 'dayjs';
export default class TripInfo extends AbstractView {
  #points = [];
  #destinations = [];
  #offers = [];

  constructor(points, destinations, offers) {
    super();
    this.#points = points;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get template() {
    const sortedPoints = [...this.#points].sort((a, b) =>
      new Date(a.startTime) - new Date(b.startTime));
    return `<section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        ${this.#createRouteTemplate(sortedPoints)}
        ${this.#createDatesTemplate(sortedPoints)}
      </div>
      ${this.#createPriceTemplate(this.#points)}
    </section>`;
  }

  #createRouteTemplate(points) {
    if (!points.length) {
      return '<h1 class="trip-info__title"></h1>';
    }

    const destinations = points.map((point) => {
      const destination = this.#destinations.find((dest) => dest.id === point.destination);
      return destination ? destination.name : '';
    }).filter(Boolean);

    let routeTitle;

    if (destinations.length <= 3) {
      routeTitle = destinations.join(' &mdash; ');
    } else {
      routeTitle = `${destinations[0]} &mdash; ... &mdash; ${destinations[destinations.length - 1]}`;
    }

    return `<h1 class="trip-info__title">${routeTitle}</h1>`;
  }

  #createDatesTemplate(points) {
    if (!points.length) {
      return '';
    }

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    const startDate = dayjs(firstPoint.startTime);
    const endDate = dayjs(lastPoint.endTime);

    const isSameMonth = startDate.month() === endDate.month();
    const formattedStartDate = startDate.format(isSameMonth ? 'MMM D' : 'MMM D');
    const formattedEndDate = endDate.format('MMM D');

    return `<p class="trip-info__dates">${formattedStartDate}&nbsp;&mdash;&nbsp;${formattedEndDate}</p>`;
  }

  #createPriceTemplate(points) {
    let totalPrice = 0;

    points.forEach((point) => {
      totalPrice += point.price;
      const pointOffers = this.#offers.find((o) => o.type === point.type)?.offers || [];
      const selectedOffers = pointOffers.filter((offer) => point.offers.includes(offer.id));
      totalPrice += selectedOffers.reduce((sum, offer) => sum + offer.price, 0);
    });

    return `<p class="trip-info__cost">
      Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalPrice}</span>
    </p>`;
  }
}
