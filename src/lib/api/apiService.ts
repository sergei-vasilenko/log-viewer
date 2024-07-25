import WampService, { IWampService } from "@/lib/api/wampService";
import { WelcomeDetail, LogsData, LoginResult } from "./types";
import { HOST, URI_PREFIX, ENDPOINTS } from "./constants";

interface IApiService {
  login(username: string, password: string): void;
  logout(): void;
  logs(callback: (event: LogsData) => void): void;
  isAuth: boolean;
}

class ApiService implements IApiService {
  private _wamp: IWampService;
  private _token: string;
  private _username: string;
  private _password: string;
  private logsHandler: (data: LogsData) => void;

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

  auth() {
    if (!this._token && (!this._username || !this._password)) {
      console.warn("Введите логин и пароль");
      return false;
    }
    const method = this._token ? ENDPOINTS.LOGIN_BY_TOKEN : ENDPOINTS.LOGIN;
    const args = this._token ? [this._token] : [this._username, this._password];
    this._wamp.call(method, args, (err, result) => {
      if (err) {
        this._token = "";
        this._username = "";
        this._password = "";
        console.error(err);
      }
      const { Token, Username } = result as LoginResult;
      this._token = Token;
      this._username = Username;
      this._wamp.subscribe(ENDPOINTS.SUBSCRIPTION_TO_LOGS, this.logsHandler);
    });
  }

  login(username: string, password: string) {
    if (this._username && this._password) return;
    this._username = username;
    this._password = password;
    this.auth();
  }

  logout(): void {
    this._wamp.unsubscribe(ENDPOINTS.SUBSCRIPTION_TO_LOGS);
    this._wamp.call(ENDPOINTS.LOGOUT);
    this._token = "";
    this._username = "";
    this._password = "";
  }

  logs(callback: (event: LogsData) => void): void {
    this.logsHandler = callback;
  }

  get isAuth() {
    return !!this._token;
  }
}

export default new ApiService(HOST, URI_PREFIX);
