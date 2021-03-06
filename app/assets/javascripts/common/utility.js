var utility = {};

/**
 * 
 * @param {Integer} id
 * @param {String} name
 * @param {String} ext
 * @returns {String} 
 */
utility.entityLink = function(id, name, ext) {
  var url = '//littlesis.org/';
  if (ext.toLowerCase() === 'person') {
    url += 'person/';
  } else {
    url += 'org/';
  }
  url += (id + '/'  + name.replace(' ', '_'));
  return url;
};


/**
 * 
 * @param {integer} x
 * @param {array} to_exclude
 * @returns {array} 
 */
utility.range = function(x, toExclude) {
  var range = Array.apply(null, Array(x)).map(function (_, i) {return i;});
  if (Array.isArray(toExclude)) {
    return range.filter(function(x) { return !toExclude.includes(x); });
  } else {
    return range;    
  }
};

/**
 * looks up entity info stored in #entity-info div 
 * @param {string} key
 * @returns {string} 
 */
utility.entityInfo = function(key) {
  return document.getElementById('entity-info').dataset[key];
};

/**
 * Relationship categories
 */
utility.relationshipCategories = [
  "",
  "Position",
  "Education (as a student)",
  "Membership",
  "Family",
  "Donation/Grant",
  "Service/Transaction",
  "Lobbying",
  "Social",
  "Professional",
  "Ownership",
  "Hierarchy",
  "Generic"
];

/**
 * Returns an nested array of [ display, fieldname, type ] 
 * possible types: 'text', 'date', 'boolean', 'money', 'number'
 * @param {number} category
 */
utility.relationshipDetails = function(category) {
  // reusable fields that are common to multiple categories
  var title = ['Title', 'description1', 'text'];
  var isCurrent = ['Is current?', 'is_current', 'boolean'];
  var startDate = ['Start date', 'start_date', 'date' ];
  var endDate = ['End date', 'end_date', 'date' ];
  var type = ['Type', 'description1', 'text'];
  var amount = ['Amount', 'amount', 'money'];
  var goods = ['Goods', 'goods', 'text'];
  var d1 = ['entity 1 is __ of entity 2', 'description1', 'text'];
  var d2 = ['entity 2 is __ of entity 1', 'description2', 'text'];
      
  switch(category) {
  case 1: // postition
    return [
      title, isCurrent, startDate, endDate,
      ['Board member?', 'is_board', 'boolean' ],
      ['Executive?', 'is_executive', 'boolean' ],
      ['Compensation','compensation', 'money' ]
    ];
  case 2: // eduction
    return [
      type, startDate, endDate,
      ['Degree', 'degree', 'text'],
      ['Field', 'education_field', 'text'],
      ['Dropout?', 'is_dropout', 'boolean']
    ];
  case 3: // members
    return [
      title, startDate, endDate, isCurrent,
      ['Membership Dues', 'membership_dues', 'money']
    ];
  case 4: // family
    return [ d1, d2, startDate, endDate, isCurrent ];
  case 5: // donation
    return [ type, amount, startDate, endDate, isCurrent, goods ];
  case 6: // transaction
    return [ d1, d2, amount, startDate, endDate, isCurrent, goods ];
  case 7: // lobby
    throw 'Lobbying relationships are not currently supposed by the bulk add tool';
  case 8: // social
    return [ d1, d2, startDate, endDate, isCurrent ];
  case 9: // professional
    return [ d1, d2, startDate, endDate, isCurrent ];
  case 10: // ownership
    return [ 
      title, startDate, endDate, isCurrent,
      [ 'Percent Stake', 'percent_stake', 'number'],
      [ 'Shares Owned', 'shares_owned', 'number']
    ];
  case 11: // hierarchy
    return [ d1, d2, startDate, endDate, isCurrent ];
  case 12: // generic
    return [ d1, d2, startDate, endDate, isCurrent ];
  default:
    throw 'Invalid relationship category. It must a be a number between 1 and 12';
  }
};

utility.validDate = function(str) {
  var date = str.split('-');
  if (date.length !== 3
      || date[0].length !== 4
      || date[1].length !== 2
      || date[2].length !== 2
      || Number(date[1]) > 12
      || Number(date[1]) < 1
      || Number(date[2]) > 31)
  {
    return false;
  }
  return true;
};
