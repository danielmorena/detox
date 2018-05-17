const ADBLogcatTailRecording = require('./ADBLogcatRecording');

class ADBLogcatLogger {
  constructor(config) {
    this.adb = config.adb;
  }

  record(artifactPath) {
    return new ADBLogcatTailRecording({
      artifactPath,
    });
  }
}

module.exports = ADBLogcatLogger;
