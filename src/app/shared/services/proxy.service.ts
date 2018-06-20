import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { CryptoService } from './crypto.service';
import { ConfigService } from './config.service';
import { $WebSocket, WebSocketSendMode } from 'angular2-websocket/angular2-websocket'
import * as oboe from 'oboe';
import { v4 } from 'uuid/v4';
import { HttpRequest, HttpResponse } from '../models/proxy';
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';
import { RegistrationRequest } from '../models/proxy/registration-request.model';
import { RegistrationResponse } from '../models/proxy/registration-response.model';

@Injectable()
export class ProxyService {

  private _base: string;
  private _id: string;
  private _ws: string;
  private _waiting: any = {};
  private _handlers: any = {};
  private _ready: Promise<any>;
  private _conn: $WebSocket;
  private _mandateToken: string;
  protected jsonConvert: JsonConvert;

  constructor(
    private http: HttpClient,
    private cryptoService: CryptoService,
    private configService: ConfigService
  ) {
    console.info(`Instantiating ProxyService`, Date.now());
    this._ready = this.initialize().then(() => console.log('Proxy initialized'));
    this.jsonConvert = new JsonConvert();
    this.jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null
  }

  public initialize(): Promise<any> {
    return this.configService.get('proxy_base')
      .then(url => {
        if (this._base !== url) {
          this._base = url;
          const ws = url.replace('https://', 'wss://').replace('http://', 'ws://');
          return this.subscribe(`${ws}/proxy/subscribe`);
        }
      })
      .catch(error => console.error(`ProxyService._ready`, error));
  }

  private register(): Promise<any> {
    return this.cryptoService.createMandateToken(this.base, [])
      .then(mandateToken => {
        const regreq = new RegistrationRequest();
        regreq.mandateToken = mandateToken;

        this.send(this.jsonConvert.serializeObject(regreq));

        return new Promise(resolve => {
          this.waitForResponse(regreq.id, (res) => {
            this._id = res.keyID;
            resolve();
          });
        });
      });
  }

  get base(): string {
    return this._base;
  }

  set base(url: string) {
    console.info(`ProxyService.base`, Date.now(), url);
    this._base = url;
    delete this._id;
    this.initialize().then(() => console.info(`ProxyService initialized`, Date.now()));
  }

  get id(): string {
    return this._id;
  }

  private send(msg: any) {
    let m = msg;
    if (typeof msg === 'object') {
      m = JSON.stringify(msg);
    }
    console.debug(`ProxyService -> ws ${m}`);
    return this._conn.send(m, WebSocketSendMode.Direct, true);
  }

  private subscribe(url: string): Promise<any> {
    if (url === '') {
      console.error('Empty url');
      return;
    }

    console.debug(`ProxyService.subscribe`, Date.now(), url);
    return new Promise(resolve => {
        this._conn = new $WebSocket(url);
        resolve();
      })
      .then(() => {
        this._conn.onError(err => console.error(`ProxyService <- ws.error`, err));
        this._conn.getDataStream().subscribe(
          (msgEvent) => {
            // console.debug("msgEvent", msgEvent);
            const msg = JSON.parse(msgEvent.data);
            if (msg['@type'] !== 'https://proxy.brickchain.com/v1/ping.json') {
              console.debug(`ProxyService <- ws.msg`, Date.now(), msgEvent.data);
            }
            switch (msg['@type']) {
              case 'https://proxy.brickchain.com/v1/ping.json':
                break;

              case 'https://proxy.brickchain.com/v1/registration-response.json':
                const registrationResponse = <RegistrationResponse>this.jsonConvert.deserializeObject(msg, RegistrationResponse);
                if (this._waiting[registrationResponse.id] !== undefined) {
                  console.log(`found a waiting registration handler for: ${registrationResponse.id}`);
                  this._waiting[registrationResponse.id](registrationResponse);
                  delete this._waiting[registrationResponse.id];
                }
                break;

              case 'https://proxy.brickchain.com/v1/http-request.json':
                const httpRequest = <HttpRequest>this.jsonConvert.deserializeObject(msg, HttpRequest);
                try {
                  const id = httpRequest.id;
                  // let data = JSON.parse(msg['data'])
                  if (this._handlers[httpRequest.url] !== undefined) {
                    this._handlers[httpRequest.url](httpRequest).then(res => {
                      res.id = id;
                      this.send(this.jsonConvert.serializeObject(res));
                    });
                  } else {
                    const res = new HttpResponse();
                    res.id = id;
                    res.status = 404;
                    res.body = 'Not found';
                    this.send(this.jsonConvert.serializeObject(res));
                  }
                } catch (err) {
                  console.error(err);
                }
                break;

              default:
                break;
            }
            // ws.close(false);
          },
          (err) => console.error(`ProxyService <- ws.error`, Date.now(), err),
          () => {
            console.debug(`ProxyService <- ws.complete`, Date.now());
            setTimeout(() => this.subscribe(url), 100);
          }
        );
      })
      .then(() => new Promise((resolve, reject) => {
        this._conn.onOpen(ready => resolve());

        setTimeout(() => reject(), 5000);
      }))
      .then(() => this.register());
  }

  public waitForResponse(id: string, f: Function) {
    this._waiting[id] = f;
  }

  public handlePath(path: string, f: (data: HttpRequest) => Promise<HttpResponse>): Promise<any> {
    return this._ready
      .then(() => this._handlers[path] = f);
  }

}
