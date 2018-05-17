class SnapshotterHooks {
  constructor({
    enabled,
    keepOnlyFailedTestsSnapshots,
    snapshotter,
    pathStrategy,
  }) {
    this._enabled = enabled;
    this._keepOnlyFailedTestsSnapshots = keepOnlyFailedTestsSnapshots;
    this._snapshotter = snapshotter;
    this._pathStrategy = pathStrategy;
    this._finalizationTasks = [];
    this._snapshotHandles = [null, null];
  }

  async onStart() {}

  async onBeforeTest(testSummary) {
    this._resetSnapshotHandles();

    if (this._shouldTakeSnapshotBefore(testSummary)) {
      await this._takeSnapshot(testSummary, 0, 'before');
    }
  }

  async onAfterTest(testSummary) {
    if (this._shouldTakeSnapshotAfter(testSummary)) {
      await this._takeSnapshot(testSummary, 1, 'after');
    }

    if (this._shouldKeepSnapshots(testSummary)) {
      this._startSavingSnapshot(0);
      this._startSavingSnapshot(1);
    } else {
      this._startDiscardingSnapshot(0);
      this._startDiscardingSnapshot(1);
    }
  }

  async onExit() {
    this._resetSnapshotHandles();
    await Promise.all(this._finalizationTasks);
  }

  async _takeSnapshot(testSummary, index, title) {
    const pathToSnapshot = this._pathStrategy.constructPathForTestArtifact(testSummary, title);
    const handle = await this._snapshotter.snapshot(pathToSnapshot);

    this._snapshotHandles[index] = handle;
  }

  _startSavingSnapshot(index) {
    const handle = this._snapshotHandles[index];

    if (handle) {
      this._finalizationTasks.push(handle.save());
    }
  }

  _startDiscardingSnapshot(index) {
    const handle = this._snapshotHandles[index];

    if (handle) {
      this._finalizationTasks.push(handle.discard());
    }
  }

  _resetSnapshotHandles() {
    this._snapshotHandles[0] = null;
    this._snapshotHandles[1] = null;
  }

  _shouldTakeSnapshots(/* testSummary */) {
    return this._enabled;
  }

  _shouldTakeSnapshotBefore(testSummary) {
    return this._shouldTakeSnapshots(testSummary);
  }

  _shouldTakeSnapshotAfter(testSummary) {
    return this._shouldKeepSnapshots(testSummary);
  }

  _shouldKeepSnapshots(testSummary) {
    if (!this._enabled) {
      return false;
    }

    const testStatus = testSummary.status;

    if (this._keepOnlyFailedTestsSnapshots && testStatus !== 'failed') {
      return false;
    }

    return true;
  }
}

module.exports = SnapshotterHooks;
