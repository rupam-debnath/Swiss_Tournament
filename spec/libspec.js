var path = require('../server/controller/players')

describe("Library Function Test", function() {
it("Returns count of matches played for particular tour_id", function(cb){
    path.getMatchesCount(1,function(error,result){
      expect(result).toBeGreaterThan(1);
      expect(error).toBe(null);
      cb();
    })
  })
})
