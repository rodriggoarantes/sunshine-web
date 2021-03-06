import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { CityWeather } from '@app/models/CityWeather';
import { City } from '@app/models/City';

@Injectable({
  providedIn: 'root',
})
export class CityWeatherStoreService {
  private readonly KEY = 'city-weather';
  private readonly subject: BehaviorSubject<Array<CityWeather>>;
  public readonly weathers$: Observable<Array<CityWeather>>;

  constructor() {
    this.subject = new BehaviorSubject<Array<CityWeather>>(this._listLocal());
    this.weathers$ = this.subject.asObservable();
  }

  public get value(): Array<CityWeather> {
    return this.subject.value;
  }

  public clear() {
    localStorage.removeItem(this.KEY);
    this.subject.next([]);
  }

  public store(suggestedWeather: CityWeather) {
    if (!suggestedWeather || !suggestedWeather.city_id) return;

    let list: Array<CityWeather> = this._listLocal();
    if (this._includeCity(suggestedWeather.city_id))
      list = list.filter((cw) => cw.city._id !== suggestedWeather.city_id);

    list.push(suggestedWeather);

    localStorage.setItem(this.KEY, JSON.stringify(list));
    this.subject.next(list);
  }

  private _listLocal(): Array<CityWeather> {
    const listLocal = JSON.parse(localStorage.getItem(this.KEY));
    if (listLocal && listLocal.length) {
      return listLocal;
    }
    return [];
  }

  private _includeCity(cityId: string) {
    return this.value.map((cw) => cw.city._id).includes(cityId);
  }
}
