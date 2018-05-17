const fs = require('fs-extra');

class AppleSimUtilsVideoRecording {
  constructor(config) {
    this.appleSimUtils = config.appleSimUtils;
    this.artifactPath = config.artifactPath;
    this.temporaryFilePath = config.temporaryFilePath;
    this.udid = config.udid;
    this.processPromise = null;
    this.process = null;
  }

  async start() {
    await fs.ensureFile(this.temporaryFilePath);
    this.processPromise = this.appleSimUtils.recordVideo(this.udid, this.temporaryFilePath);
    this.process = this.processPromise.childProcess;
  }

  async stop() {
    if (!this.process) {
      return;
    }

    this.process.kill('SIGINT');
    await this.processPromise;
  }

  async save() {
    await fs.ensureFile(this.artifactPath);
    await fs.move(this.temporaryFilePath, this.artifactPath, {
      overwrite: true
    });
  }

  async discard() {
    await fs.remove(this.temporaryFilePath);
  }
}

module.exports = AppleSimUtilsVideoRecording;