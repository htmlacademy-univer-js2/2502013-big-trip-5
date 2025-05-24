const EVENT_TYPES = [
  { type: 'taxi', label: 'Taxi' },
  { type: 'bus', label: 'Bus' },
  { type: 'train', label: 'Train' },
  { type: 'ship', label: 'Ship' },
  { type: 'drive', label: 'Drive' },
  { type: 'flight', label: 'Flight' },
  { type: 'check-in', label: 'Check-in' },
  { type: 'sightseeing', label: 'Sightseeing' },
  { type: 'restaurant', label: 'Restaurant' }
];


const OFFERS = {
  taxi: [
    { id: 'offer-luggage', title: 'Add luggage', price: 50 },
    { id: 'offer-comfort', title: 'Switch to comfort', price: 80 }
  ],
  drive: [
    { id: 'offer-seats', title: 'Choose seats', price: 5 }
  ],
  flight: []
};

const USER_ACTION = {
  ADD_POINT: 'ADD_POINT',
  UPDATE_POINT: 'UPDATE_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

export { OFFERS, EVENT_TYPES, USER_ACTION };
