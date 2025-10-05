// Minimal in-memory stub for reminder queue used in tests
export const reminderQueue = {
  add: async (job, opts) => {
    // In production this would push to Bull/Redis; for tests we just log and resolve
    console.log('reminderQueue.add called', job, opts);
    return Promise.resolve({ id: 'stub-job-id' });
  },
};
