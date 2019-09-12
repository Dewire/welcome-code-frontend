export const options = [
  {
    name: {
      sv: 'Kommunikationer', en: 'Transportation',
    },
    options: {
      objectLabel: 'transportation',
      subLabels: ['bus', 'train', 'airport'],
      types: ['bus_station', 'train_station', 'airport'],
      query: ['Bus stop', 'Train station', 'Airport'],
      sv: ['Busshållplats', 'Tågstation', 'Flygplats'],
      en: ['Bus stop', 'Train station', 'Airport'],
    },
  },
  {
    name: {
      sv: 'Skolor', en: 'Schools',
    },
    options: {
      objectLabel: 'schools',
      subLabels: ['pre', 'primary', 'gym', 'adult', 'folk'],
      types: ['', '', '', '', ''],
      query: ['Preschool', ['Primary School', 'Elementary School'], 'High School', 'Adult Education', 'Folk High School'],
      sv: ['Förskolor', 'Grundskolor', 'Gymnasium', 'Vuxenutbildning', 'Folkhögskolor'],
      en: ['Preschools', 'Primary Schools', 'High Schools', 'Adult Education', 'Folk High Schools'],
    },
  },
  {
    name: {
      sv: 'Shopping', en: 'Shopping',
    },
    options: {
      objectLabel: 'shopping',
      subLabels: ['food', 'pharma', 'center', 'alco'],
      types: ['', 'pharmacy', '', 'liquor_store'],
      query: ['Grocery Store', 'Pharmacy', 'Shopping mall', 'Liquor store'],
      sv: ['Livsmedelsbutik', 'Apotek', 'Köpcentra', 'Systembolaget'],
      en: ['Grocery Store', 'Pharmacy', 'Shopping mall', 'Liquor store'],
    },
  },
  {
    name: {
      sv: 'Sport & Fritid', en: 'Sports & Leisure',
    },
    options: {
      objectLabel: 'sports',
      subLabels: ['training', 'swim', 'bath', 'boat', 'hike', 'fishing', 'slalom', 'cross', 'golf', 'parks'],
      types: ['gym', '', '', '', '', '', '', '', ''],
      query: ['Exercise facilities', 'swimming facility', 'swimming facility', 'Marinas', 'Hiking trails', 'Fishing', 'Ski slopes', 'Cross country skiing', 'Golf courses', 'Parks'],
      sv: ['Träningsanläggningar', 'Simhallar', 'Badplatser', 'Båthamnar', 'Vandringsleder', 'Fiskeplatser', 'Slalombackar', 'Längdskidesanläggningar', 'Golfbanor', 'Parker'],
      en: ['Exercise facilities', 'Swimming halls', 'Bathing areas', 'Marinas', 'Hiking trails', 'Fishing', 'Ski slopes', 'Cross country skiing', 'Golf courses', 'Parks'],
    },
  },
  {
    name: {
      sv: 'Kultur', en: 'Culture',
    },
    options: {
      objectLabel: 'culture',
      subLabels: ['cinema', 'museum', 'theater', 'library', 'churches'],
      types: ['movie_theater', '', '', '', ''],
      query: ['Cinemas', 'Museums', 'Teaters', 'Libraries', 'Churches'],
      sv: ['Biografer', 'Museum', 'Teater', 'Bibliotek', 'Kyrkor'],
      en: ['Cinemas', 'Museums', 'Teaters', 'Libraries', 'Churches'],
    },
  },
  {
    name: {
      sv: 'Övrigt', en: 'Other',
    },
    options: {
      objectLabel: 'other',
      subLabels: ['hospital', 'vc', 'youth', 'restau', 'police', 'dentist', 'postal', 'car', 'plumber', 'electric'],
      types: ['', '', '', 'restaurant', 'police', '', 'post_office', '', '', ''],
      query: ['Hospital', 'Health centers', 'Youth centers', 'Restaurants', 'Police', 'Dentist', 'Post office', 'Car repair', 'Plumber', 'Electrician'],
      sv: ['Sjukhus', 'Vårdcentral', 'Fritidsgårdar', 'Restauranger', 'Polis', 'Tandläkare', 'Post', 'Bilverkstad', 'Rörmokare', 'Elektriker'],
      en: ['Hospital', 'Health centers', 'Youth centers', 'Restaurants', 'Police', 'Dentist', 'Post office', 'Car repair', 'Plumber', 'Electrician'],
    },
  },
];
