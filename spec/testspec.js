var request = require("request");
var server = require('../server')

var base_url = "http://localhost:5000/"

describe("Server Test", function() {

  it("returns status code 200", function(done) {
    request.get(base_url, function(error, response) {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
