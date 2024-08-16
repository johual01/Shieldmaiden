import { db } from 'src/firebase';
import { extend, ValidationObserver,  ValidationProvider } from 'vee-validate';
import { required, length, max, min, max_value, min_value, alpha_dash, numeric, alpha_num, email, confirmed} from "vee-validate/dist/rules";
import { i18n } from './i18n';

export default async ({ Vue }) => {
  Vue.component('ValidationProvider', ValidationProvider);
  Vue.component('ValidationObserver', ValidationObserver);

  extend("required", {
    ...required,
    message: (field) => i18n.t('validation.required', { field: field })
  });
  extend("max", {
    ...max,
    message: (field, params) => i18n.t('validation.max', {field: field, length: params.length})
  });
  extend("max_value", {
    ...max_value,
    message: (field, params) => i18n.t('validation.max_value', {field: field, max: params.max})
  });
  extend("min", {
    ...min,
    message: (field, params) => i18n.t('validation.min', {field: field, length: params.length})
  });
  extend("min_value", {
    ...min_value,
    message: (field, params) => i18n.t('validation.min_value', {field: field, min: params.min})
  });
  extend('length', length);
  extend('alpha_dash', {
    ...alpha_dash,
    message: (field) => i18n.t('validation.alpha_dash', {field: field})
  });
  extend("numeric", numeric);
  extend('alpha_num', {
    ...alpha_num,
    message: (field) => i18n.t('validation.alpha_num', {field: field})
  });

  extend("email", {
    ...email,
    message: (field) => i18n.t('validation.email', {field: field})
  });

  // Value is same as other field
  extend("confirmed", confirmed);

  // Value must be between 2 numbers
  extend("between", {
    validate(value, { minimum, maximum } = {}) {
      return Number(minimum) <= value && Number(maximum) >= value;
    },
    params: ["minimum", "maximum"],
    message: (_, params) => i18n.t('validation.between', {minimum: params.minimum, maximum: params.maximum})
  });

  // Recharge 1, 5-6 or rest
  extend('recharge', {
    validate(value) {
      if (value) {
        const regex = /^[\d]+(-[\d]+)*$/;
        return regex.test(value) || value === "rest";
      } return false;
    },
    message: i18n.t('validation.recharge'),
  });

  // Range
  extend('range', {
    validate(value) {
      if (value) {
        const regex = /^[\d]+(\/[\d]+)*$/g;
        return regex.test(value);
      } return false;
    },
    message: i18n.t('validation.range'),
  });

  // Hit dice
  extend('hit_dice', {
    validate(value) {
      if (value) {
        const regex = /^[\d]+d[\d]+$/;
        return regex.test(value);
      } return false;
    },
    message: i18n.t('validation.hit_dice'),
  });

  // Validate url input
  extend('url', {
    validate(value) {
      if (value) {
        const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z\d]+([-.]{1}[a-z\d]+)*\.[a-z]{2,5}(:[\d]{1,5})?(\/.*)?$/;
        return regex.test(value);
      } return false;
    },
    message: (field) => i18n.t('validation.url', {field: field}),
  });

  extend('audio', {
    validate(value) {
      if (value) {
        // Check if value is url
        const url_expr = /[A-z\d@:%._+~#=-]{1,256}\.[A-z\d()]{1,6}\b([A-z\d()@:%_+.~#?&/=-]+)?/gi;
        if (value.match(url_expr)) {
          return true;
        }
        // Check if value is spotify URI
        const spotify_expr  = /^spotify:.+/gi;
        
        return value.match(spotify_expr);
      } return false;
    },
    message: (field) => i18n.t('validation.audio', {field: field}),
  });

  // Check if variable used in a description, exists
  extend('variable_check', {
    message: (field) => i18n.t('validation.variable_check', {field: field.toLowerCase()}),
    validate: (value, variables) => {
      let regexpr = /\[(\w+)\]/g;
      let text_vars = value.match(regexpr, "$1");
      if (!text_vars)
        return true;
      for (let v of text_vars) {
        let stripped = v.slice(1,-1);
        if (!variables[0] || !Object.keys(variables[0]).includes(stripped))
          return false
      }
      return true;
    }
  });

  extend('json', {
    message: i18n.t('validation.json'),
    validate: (value) => {
      try {
        JSON.parse(value);
        return true;

      } catch {
        return false;
      }
    }
  });

  extend('username', {
    message: i18n.t('validation.username'),
    validate: async (value) => {
      let username_ref = db.ref(`search_users`).orderByChild('username').equalTo(value.toLowerCase());
  
      // Check username
      let exists = false
      await username_ref.once('value' , (snapshot) => {
        exists = snapshot.exists();
      });

      return !exists;
    }
  })
};