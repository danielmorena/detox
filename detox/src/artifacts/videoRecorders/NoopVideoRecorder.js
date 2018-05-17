class NoopVideoRecording {
  async start() {}
  async stop() {}
  async save() {}
  async discard() {}
}

class NoopVideoRecorder {
  record() {
    return new NoopVideoRecording();
  }
}

module.exports = NoopVideoRecorder;