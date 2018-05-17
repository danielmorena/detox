class RecorderHooks {
  constructor({
    enabled,
    keepOnlyFailedTestsRecordings,
    recorder,
    pathStrategy
  }) {
    this._enabled = enabled;
    this._keepOnlyFailedTestsRecordings = keepOnlyFailedTestsRecordings;
    this._recorder = recorder;
    this._pathStrategy = pathStrategy;

    this._startupRecording = null;
    this._testRecording = null;

    this._isRunningFirstTest = true;
    this._hasFailingTests = false;
    this._finalizationTasks = [];
  }

  async onStart() {
    if (this.shouldRecordStartup()) {
      const startupRecordingPath = this._pathStrategy.constructPathForUniqueArtifact('startup');

      this._startupRecording = this._recorder.record(startupRecordingPath);
      await this._startupRecording.start();
    }
  }

  async onBeforeTest(testSummary) {
    if (this._isRunningFirstTest) {
      this._isRunningFirstTest = false;
      await this._startupRecording.stop();
    }

    if (this.shouldRecordTest(testSummary)) {
      const testRecordingPath = this._pathStrategy.constructPathForTestArtifact(testSummary, 'test');

      this._testRecording = this._recorder.record(testRecordingPath);
      await this._testRecording.start();
    }
  }

  async onAfterTest(testSummary) {
    this.checkIfTestFailed(testSummary);

    const recording = this._testRecording;
    if (recording == null)  {
      return;
    }

    await recording.stop();

    const finalizationTask = this.shouldKeepTestRecording(testSummary)
      ? recording.save()
      : recording.discard();

    this._enqueue(finalizationTask);
    this._testRecording = null;
  }

  async onExit() {
    const startupRecording = this._startupRecording;

    if (startupRecording !== null) {
      const finalizationTask = this.shouldKeepStartupRecording()
        ? startupRecording.save()
        : startupRecording.discard();

      this._enqueue(finalizationTask);
    }

    await Promise.all(this._finalizationTasks);
  }

  shouldRecordStartup() {
    return this._enabled;
  }

  shouldRecordTest(/* testSummary */) {
    return this._enabled;
  }

  shouldKeepStartupRecording() {
    if (this._keepOnlyFailedTestsRecordings && !this._hasFailingTests) {
      return false;
    }

    return true;
  }

  shouldKeepTestRecording(testSummary) {
    const testStatus = testSummary.status;

    if (this._keepOnlyFailedTestsRecordings && testStatus !== 'failed') {
      return false;
    }

    return true;
  }

  checkIfTestFailed(testSummary) {
    const testStatus = testSummary.status;

    if (testStatus === 'failed') {
      this._hasFailingTests = true;
    }
  }

  _enqueue(finalizationTaskPromise) {
    this._finalizationTasks.push(finalizationTaskPromise);
  }
}

module.exports = LogRecorderHooks;