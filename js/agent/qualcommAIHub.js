/**
 * Local AI Engine (stub)
 * Previously used Qualcomm AI Hub for NPU inference.
 * Now simply returns null so the cloud API is always used.
 */

export class LocalAIEngine {
  constructor() {
    this.initStatus = "ready";
  }

  /**
   * Always returns null — falls through to cloud API.
   */
  async runLocalInference(_prompt, _examContext) {
    return null;
  }

  getHardwareDiagnostics() {
    return {
      status: this.initStatus,
      provider: "Cloud (OpenRouter)",
    };
  }
}

export const qualcommAIHub = new LocalAIEngine();
