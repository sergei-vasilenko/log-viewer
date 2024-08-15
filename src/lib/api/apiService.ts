import WampService, { IWampService } from "@/lib/api/wampService";
import { WelcomeDetail, LogsResult, LoginResult } from "./types";
import { HOST, URI_PREFIX, ENDPOINTS } from "./constants";

interface IApiService {
  login(
    username: string,
    password: string
  ): Promise<{ token: string; username: string }>;
  logout(): Promise<void>;
  logs(callback: (event: LogsResult) => void): void;
  isAuth: boolean;
}

class ApiService implements IApiService {
  private _wamp: IWampService;
  private _token: string;
  private _username: string;
  private _password: string;
  private logsHandler: (data: LogsResult) => void;

  constructor(host: string, uriPrefix: string) {
    this._token = "";
    this._username = "";
    this._password = "";
    this.logsHandler = () => undefined;
    this._wamp = new WampService({
      url: host,
      uriPrefix,
    });

    this.setBasicListeners();
  }

  private setBasicListeners() {
    this._wamp.on("reconnect", () => {
      this.auth();
    });

    this._wamp.on("welcome", ({ detail }) => {
      const { session_id, wamp_version, server_name } = detail as WelcomeDetail;
      console.log(
        `Добро пожаловать!\nSession id: ${session_id}\nProtocol version: ${wamp_version}\nServer name: ${server_name}`
      );
      this.auth();
    });
  }

  async auth() {
    if (!this._token && (!this._username || !this._password)) {
      console.warn("Введите логин и пароль");
      return { token: "", username: "" };
    }
    const method = this._token ? ENDPOINTS.LOGIN_BY_TOKEN : ENDPOINTS.LOGIN;
    const args = this._token ? [this._token] : [this._username, this._password];
    try {
      const result = await this._wamp.call(method, args);
      const { Token, Username } = result as LoginResult;
      this._token = Token;
      this._username = Username;
      this._wamp.subscribe(ENDPOINTS.SUBSCRIPTION_TO_LOGS, (data) =>
        this.logsHandler(data)
      );
    } catch (err) {
      this._token = "";
      this._username = "";
      this._password = "";
      console.error(err);
    }
    return { token: this._token, username: this._username };
  }

  async login(
    username: string,
    password: string
  ): Promise<{ token: string; username: string }> {
    if (this._username && this._password) return { token: "", username: "" };
    this._username = username;
    this._password = password;
    return await this.auth();
  }

  async logout(): Promise<void> {
    try {
      this._wamp.unsubscribe(ENDPOINTS.SUBSCRIPTION_TO_LOGS);
      await this._wamp.call(ENDPOINTS.LOGOUT);
      this._token = "";
      this._username = "";
      this._password = "";
    } catch (err) {
      console.error(err);
    }
  }

  logs(callback: (event: LogsResult) => void): void {
    this.logsHandler = callback;
  }

  get isAuth() {
    return !!this._token;
  }
}

export default new ApiService(HOST, URI_PREFIX);
