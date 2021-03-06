import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import jwtDecode, { JwtPayload } from 'jwt-decode';

import { environment } from '@app/../environments/environment';

import { User } from '@app/models/User';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly KEY = 'USER';
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;

  private readonly apiUsers = `${environment.baseUrl}/users`;
  private readonly apiLogin = `${environment.baseUrl}/login`;

  constructor(private http: HttpClient) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(this.KEY)));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  public create(name: string, email: string, pass: string, confirmPass: string): Observable<User> {
    return this.http.post<User>(`${this.apiUsers}`, {
      name,
      email,
      pass,
      confirmPass,
    });
  }

  public login(email: string, pass: string): Observable<User> {
    return this.http
      .post<User>(`${this.apiLogin}`, {
        email,
        pass,
      })
      .pipe(
        map((user) => {
          localStorage.setItem(this.KEY, JSON.stringify(user));
          this.userSubject.next(user);
          return user;
        })
      );
  }

  public logout() {
    localStorage.removeItem(this.KEY);
    this.userSubject.next(null);
  }

  public isAuth(): boolean {
    if (this.userValue && this.userValue.token) {
      const payload: JwtPayload = jwtDecode<JwtPayload>(this.userValue.token);
      if (payload && payload.exp && this.notExpired(payload.exp)) {
        return true;
      }
    }
    localStorage.removeItem(this.KEY);
    return false;
  }

  private notExpired(dateTime: number) {
    const now: number = new Date().getTime();
    const dataIso = parseInt(String(dateTime).padEnd(13, '1').substring(0, 13), 10);
    return dataIso > now;
  }
}
