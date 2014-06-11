'use strict';

describe('Service: ArenaFactory', function () {

  // load the service's module
  beforeEach(module('facePongApp'));

  // instantiate service
  var ArenaFactory;
  beforeEach(inject(function (_ArenaFactory_) {
    ArenaFactory = _ArenaFactory_;
  }));

  it('should do something', function () {
    expect(!!ArenaFactory).toBe(true);
  });

});
