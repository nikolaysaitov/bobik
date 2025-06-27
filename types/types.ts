export interface SubscribeMsg {
    op: string;
    args: Array<{
      channel: string;
      instId: string;
    }>;
  }