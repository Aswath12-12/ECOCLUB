const DEFAULT_STUDENT_PASSWORD = 'eocsxcce';

const HOUSE_CODES = {
  GREEN: 'GREEN',
  BLUE: 'BLUE',
  RED: 'RED',
  YELLOW: 'YELLOW'
};

const INITIAL_HOUSES = [
  {
    name: 'Green House',
    code: 'GREEN',
    description: 'Champions of environmental conservation and forestry.',
    colorCode: '#10B981',
    active: true
  },
  {
    name: 'Blue House',
    code: 'BLUE',
    description: 'Guardians of water bodies, marine ecosystems, and clean rivers.',
    colorCode: '#3B82F6',
    active: true
  },
  {
    name: 'Red House',
    code: 'RED',
    description: 'Pioneers in climate action, renewable energy, and emissions reduction.',
    colorCode: '#EF4444',
    active: true
  },
  {
    name: 'Yellow House',
    code: 'YELLOW',
    description: 'Leaders in solar awareness, sustainable living, and zero-waste initiatives.',
    colorCode: '#F59E0B',
    active: true
  }
];

const ROLES = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT'
};

const RESET_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED'
};

module.exports = {
  DEFAULT_STUDENT_PASSWORD,
  HOUSE_CODES,
  INITIAL_HOUSES,
  ROLES,
  RESET_STATUS
};
