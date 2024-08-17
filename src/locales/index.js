import characters from './characters.js';
import validations from './validations.js';
import components from './components.js';
import commons from './commons.js';
import _ from 'lodash';

export default _.merge(characters, validations, components, commons);