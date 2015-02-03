var logger = require('./../lib/logger')
  , log = logger.log;

logger.registerLevels({
  IMPORTANT: 1.5,
  /**
   *  Current levels are : ERROR, WARN, INFO, DEBUG, TRACE
   *  with a level value equal to its index (0 to 4).
   *  Adding a new level with a value of 1.5 will have the effect to insert the new level between values 1 and 2
   *  After having the new level inserted, the all level values are redefined to reflect indexes of an array
   */
  FED_UP: 99 // very high level means very low priority
});

log.important('hello %s!', 'world');
log.debug('does nothing');
log.error('ouch');
log.fedUp('boring log'); // methods are in camel case
console.log(logger.getLevels());
/**
 *  After having the new level inserted, the all level values are redefined to reflect indexes of an array
 */

logger.setLevel('fed_up'); // lower or upper case, don't care, but the format has to be snake case for levels
log.fedUp('boring again'); // now it should display