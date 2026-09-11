type Payload = Record<string, unknown>;
type Session = {
  generation: number;
  hostSessionId?: string;
  workspace: unknown;
};

/** Capture correlation and lifecycle before awaiting any iframe operation. */
export function createWebMcpRequestDispatcher(options: {
  handlers: Record<string, (payload: Payload) => unknown>;
  getSession: () => Session;
  respond: (payload: Payload, requestId: string) => void;
}) {
  return async (payload: Payload, requestId: string): Promise<boolean> => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload))
      return false;
    const action = payload.action;
    if (
      typeof action !== "string" ||
      !Object.prototype.hasOwnProperty.call(options.handlers, action)
    )
      return false;
    const session = options.getSession();
    if (
      session.hostSessionId !== undefined &&
      payload.hostSessionId !== session.hostSessionId
    )
      return false;
    let result: unknown;
    try {
      result = await options.handlers[action](payload);
    } catch (error) {
      result = {
        ok: false,
        code: "SCRIPT_OPERATION_FAILED",
        error: error instanceof Error ? error.message : String(error),
      };
    }
    const current = options.getSession();
    if (
      current.generation !== session.generation ||
      current.hostSessionId !== session.hostSessionId ||
      current.workspace !== session.workspace
    )
      return true;
    options.respond(
      {
        action,
        ...(result as Payload),
        ...(session.hostSessionId === undefined
          ? {}
          : { hostSessionId: session.hostSessionId }),
      },
      requestId
    );
    return true;
  };
}
