declare interface User {
  name: string;
  email: string;
  password?: string;
  ggId?: string;
  avatar?: string;
  friends: string[];
  friendreq: string[];
  roomJoined: string[];
  loginWithGG?: boolean | undefined;
  notification: [
    {
      msg: string;
      senderId: string;
      time: string;
      _id: string;
    }
  ];
}

declare interface Message {
  userId: string;
  message: string;
  time: string;
  image?: string;
}

declare type StaticOrigin =
  | boolean
  | string
  | RegExp
  | (boolean | string | RegExp)[];

declare type CustomOrigin = (
  requestOrigin: string | undefined,
  callback: (err: Error | null, origin?: StaticOrigin) => void
) => void;

declare interface CorsOptions {
  /**
   * @default '*''
   */
  origin?: StaticOrigin | CustomOrigin | undefined;
  /**
   * @default 'GET,HEAD,PUT,PATCH,POST,DELETE'
   */
  methods?: string | string[] | undefined;
  allowedHeaders?: string | string[] | undefined;
  exposedHeaders?: string | string[] | undefined;
  credentials?: boolean | undefined;
  maxAge?: number | undefined;
  /**
   * @default false
   */
  preflightContinue?: boolean | undefined;
  /**
   * @default 204
   */
  optionsSuccessStatus?: number | undefined;
}

declare interface CorsRequest {
  method?: string | undefined;
  headers: IncomingHttpHeaders;
}
