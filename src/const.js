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

const USER_ACTION = {
  ADD_POINT: 'ADD_POINT',
  UPDATE_POINT: 'UPDATE_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

const API_BASE_URL = 'https://24.objects.htmlacademy.pro/big-trip';
const API_AUTHORIZATION = 'Basic 9a8ds7f9ashg9hj4a';

export { EVENT_TYPES, USER_ACTION, API_BASE_URL, API_AUTHORIZATION };
