import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayRootService {
  private outSideClickEvent$ = new Subject();
  public getOnOutsideClick$(){ return this.outSideClickEvent$.asObservable(); }
  public setOnOutsideClick(value:any){ this.outSideClickEvent$.next(value); }

  private onOverlayVisibleEvent$ = new Subject();
  public getOnOverlayVisibleEvent$(){ return this.onOverlayVisibleEvent$.asObservable(); }
  public setOnOverlayVisibleEvent(value:any){ this.onOverlayVisibleEvent$.next(value); }

  constructor(private ngZone: NgZone) {
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('click', (event: MouseEvent) => {
        this.ngZone.run(() => {
          this.setOnOutsideClick(event);
        });
      });
    });
  }

}
