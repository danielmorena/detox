const AppleSimUtilsLogTailRecording = require('./AppleSimUtilsLogTailRecording');

// TODO: implement
class AppleSimUtilsLogger {
  constructor({}) {
  }

  record(artifactPath) {
    return new AppleSimUtilsLogTailRecording({
      artifactPath,
    });
  }
}

module.exports = AppleSimUtilsLogger;