/* tslint:disable:variable-name */
import {INestApplication} from '@nestjs/common';
import request from 'supertest';
import {IGoogleUser} from 'modules/auth';
import {testingDefaults} from 'config/env';
import {INotebook, INote, IFolder, IFile} from 'shared';

const defaultCookie = testingDefaults.AuthCookieName;

interface GetFunctionTypeHelper {
  (url: 'users'): Promise<IGoogleUser[]>;
  (url: 'files'): Promise<IFile[]>;
  (url: 'files', id: string): Promise<IFolder>;
  (url: 'note', id: string): Promise<INote>;
  (url: 'notebook', id: string): Promise<INotebook>;
  (...url: string[]): Promise<any>;
}

const createUserCookie = (user: IGoogleUser) =>
  Buffer.from(JSON.stringify(user)).toString('base64');

class HttpHelper {
  constructor(
    protected _supertest: request.SuperTest<request.Test>,
    protected user?: IGoogleUser,
  ) {}

  public baseGet(url: string) {
    let chain = this._supertest.get('/api/' + url);
    if (this.user) {
      chain = chain.set(
        'Cookie',
        `${defaultCookie}=${createUserCookie(this.user)}`,
      );
    }
    return chain;
  }

  search = async (term: string, offset = 0, total = 5) =>
    (await this.baseGet(['search', encodeURIComponent(term)].join('/')).query({
      offset,
      total,
    })).body;

  get: GetFunctionTypeHelper = async (...url: string[]) =>
    (await this.baseGet(url.join('/')).expect(200)).body;

  getAndExpectFail = (url: string, errorCode: number) =>
    this.baseGet(url).expect(errorCode);

  private basePost(url: string, data: any) {
    let chain = this._supertest.post('/api/' + url);
    if (this.user) {
      chain = chain.set('Cookie', [
        `${defaultCookie}=${createUserCookie(this.user)}`,
      ]);
    }
    return chain.send(data);
  }

  post = (url: string, data: any) => this.basePost(url, data).expect(200);

  postAndExpectFail = (url: string, data: any, errorCode: number) =>
    this.basePost(url, data).expect(errorCode);

  postEvents = (data: any) =>
    this.basePost('events', data)
      .send(data)
      .expect(200);
}

export class E2EDriver extends HttpHelper {
  private users: Map<string, IGoogleUser> = new Map();

  constructor(private app: INestApplication) {
    super(request(app.getHttpServer()));
  }

  addUser(nickname: string, up: IGoogleUser) {
    this.users.set(nickname, up);
    return this;
  }

  setDefaultUser(nickname: string) {
    this.user = this.users.get(nickname);
  }

  as = (username: string) => {
    const user = this.users.get(username);
    return new HttpHelper(this._supertest, user);
  };

  doLogin(nickname: string) {
    const user = this.users.get(nickname);
    if (!user) {
      throw new Error();
    }
    return this.get(
      `authenticate?code=${encodeURIComponent(JSON.stringify(user))}`,
    );
  }

  get supertest() {
    return this._supertest;
  }
}
