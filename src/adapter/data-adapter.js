const adaptPointToClient = (point) => {
  const adaptedPoint = {
    ...point,
    startTime: point['date_from'],
    endTime: point['date_to'],
    price: point['base_price'],
    isFavorite: point['is_favorite'],
  };

  delete adaptedPoint['date_from'];
  delete adaptedPoint['date_to'];
  delete adaptedPoint['base_price'];
  delete adaptedPoint['is_favorite'];

  return adaptedPoint;
};

const adaptDestinationToClient = (destination) => destination;

const adaptOfferToClient = (offer) => offer;

export { adaptPointToClient, adaptDestinationToClient, adaptOfferToClient };
