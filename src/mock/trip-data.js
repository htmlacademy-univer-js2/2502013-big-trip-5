const DESTINATIONS = {
  geneva: {
    id: 'geneva',
    name: 'Geneva',
    description: 'City in Switzerland',
    photos: ['https://loremflickr.com/248/152?random=1']
  },
  chamonix: {
    id: 'chamonix',
    name: 'Chamonix',
    description: 'Mountain resort in the Alps',
    photos: ['https://loremflickr.com/248/152?random=2']
  },
  amsterdam: {
    id: 'amsterdam',
    name: 'Amsterdam',
    description: 'The capital of the Netherlands',
    photos: ['https://loremflickr.com/248/152?random=3']
  }
};

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

export const generateTripPoints = () => [
  {
    id: '1',
    type: 'taxi',
    destination: DESTINATIONS['geneva'],
    startTime: '2020-09-10T10:00',
    endTime: '2020-09-10T11:00',
    price: 20,
    isFavorite: false,
    offers: OFFERS['taxi']
  },
  {
    id: '2',
    type: 'flight',
    destination: DESTINATIONS['chamonix'],
    startTime: '2020-09-11T12:25',
    endTime: '2020-09-11T13:35',
    price: 160,
    isFavorite: false,
    offers: OFFERS['flight']
  },
  {
    id: '3',
    type: 'drive',
    destination: DESTINATIONS['amsterdam'],
    startTime: '2020-09-12T08:25',
    endTime: '2020-09-12T09:25',
    price: 100,
    isFavorite: true,
    offers: OFFERS['drive']
  }
];
