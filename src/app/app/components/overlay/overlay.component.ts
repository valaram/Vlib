//import { animate, state, style, transition, trigger, AnimationEvent } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, ElementRef, Inject, input, model, OnChanges, OnDestroy, OnInit, Signal, signal, SimpleChanges, viewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { OverlayRootService } from './overlay-root.service';

@Component({
  selector: 'v-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss',
  host: {
    '[style.display]': 'hostDisplay()'
  }
  /*animations: [
    trigger('animation', [
      state('void', style({
        'margin-top': '-15px'
      })),
      state('visible', style({
        'margin-top': '0px'
      })),
      transition('void => visible', animate('225ms ease-out')),
      transition('visible => void', animate('195ms ease-in'))
    ])
  ]*/
})
export class OverlayComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  idFocusOnClose = input<string>('');
  target = input.required<HTMLElement>();
  direction = input<Direction>('bottom');
  alignment = input<Alignment>('center');
  showArrow = input(false);
  padding = signal('4px');
  autoAlignment = input(false);

  container = viewChild<ElementRef>('container');
  hostDisplay = computed(() => { return this.visible() ? 'block' : 'none'; });

  visible = signal(false);
  containerStyle = signal(this.getDefaultContainerStyle());
  arrowStyle = signal(this.getDefaultArrowStyle());

  getContainerDimension() {
    if (this.container()) {
      const rect = this.container()?.nativeElement.getBoundingClientRect() as DOMRect;
      return rect;
    } else {
      return null;
    }
  };

  getTargetDimension() {
    if (this.target()) {
      const rect = this.target()?.getBoundingClientRect() as DOMRect;
      return rect;
    } else {
      return null;
    }
  };

  getDefaultArrowStyle() {
    return {
      left: '0',
      top: '0',
      margin: '0',
      position: '0',
      transform: '0',
      display: 'none'
    };
  }

  getDefaultContainerStyle() {
    return {
      left: '0px',
      top: '0px',
      margin: '0px'
    };
  }

  subscriptions = new Subscription();

  constructor(private hostRef: ElementRef, public overlayRootService: OverlayRootService) { }

  ngOnInit(): void {
    this.subscriptions.add(this.overlayRootService?.getOnOutsideClick$().subscribe((e: any) => {
      this.hideOnClickOutside(e.target);
    }));

    this.subscriptions.add(this.overlayRootService?.getOnOverlayVisibleEvent$().subscribe((e: any) => {
      this.hideThisOverlayIfOtherOpen(e)
    }));
  }

  hideOnClickOutside(target: any) {
    if (!this.visible()) return; // if i am not visible
    if (!this.target() || !this.container()) return; //if i dont have target or container
    if (this.target()?.contains(target)) return; // if i am click on my own input
    if (this.container()?.nativeElement?.contains(target)) return; // if i am clicking on my own content

    this.hide();
  }

  //hide my self if other overlay is opening
  hideThisOverlayIfOtherOpen(hostRefNativeElement: any) {
    if (this.visible() && this.hostRef && this.hostRef.nativeElement !== hostRefNativeElement) {
      this.hide();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {

  }

  toggle() {
    if (this.visible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    this.visible.set(true);
    setTimeout(() => {
      const res = this.calculateOverlayPosition();
      if (res.working) {
        this.setContentAndArrowStyle(res.pos.left, res.pos.top, res.direction, res.alignment);
      } else {
        this.calculateForNotWorkingCase();
      }
    });
    if (this.hostRef) {
      //fire root event to alert every overlay that i am opening
    }
  }

  hide() {
    this.visible.set(false);
    this.containerStyle.set(this.getDefaultContainerStyle());
    this.arrowStyle.set(this.getDefaultArrowStyle());
    if (this.idFocusOnClose()) {
      const elm = document.getElementById(this.idFocusOnClose());
      if (elm) elm.focus();
    }
  }

  windowWidth() {
    return window.innerWidth || document.documentElement.clientWidth;
  }

  windowHeight() {
    return window.innerHeight || document.documentElement.clientHeight;
  }

  getRectByDirectionAndAlignment(direction?: Direction, alignment?: Alignment): Rect {
    let dir = direction || this.direction();
    let align = alignment || this.alignment();

    let left = 0;
    let top = 0;
    let cont = this.getContainerDimension();
    let targ = this.getTargetDimension();

    if (cont && targ) {
      if (dir === 'bottom') {
        top = targ.top + targ.height;
        if (align === 'center') {
          left = targ.left + (targ.width / 2) - (cont.width / 2);
        } else if (align === 'end') {
          left = targ.left + targ.width - cont.width;
        } else if (align === 'start') {
          left = targ.left;
        } else if (align === 'furthest-start') {
          left = targ.left - cont.width;
        } else if (align === 'furthest-end') {
          left = targ.left + targ.width;
        }
      } else if (dir == 'top') {
        top = targ.top - cont.height;
        if (align === 'center') {
          left = targ.left + (targ.width / 2) - (cont.width / 2);
        } else if (align === 'end') {
          left = targ.left + targ.width - cont.width;
        } else if (align === 'start') {
          left = targ.left;
        } else if (align === 'furthest-start') {
          left = targ.left - cont.width;
        } else if (align === 'furthest-end') {
          left = targ.left + targ.width;
        }
      } else if (dir == 'left') {
        left = targ.left - cont.width;
        if (align === 'center') {
          top = targ.top + (targ.height / 2) - (cont.height / 2);
        } else if (align === 'end') {
          top = targ.top + targ.height - cont.height;
        } else if (align === 'start') {
          top = targ.top;
        } else if (align === 'furthest-start') {
          top = targ.top - cont.height;
        } else if (align === 'furthest-end') {
          top = targ.top + targ.height;
        }
      } else if (dir == 'right') {
        left = targ.left + targ.width;
        if (align === 'center') {
          top = targ.top + (targ.height / 2) - (cont.height / 2);
        } else if (align === 'end') {
          top = targ.top + targ.height - cont.height;
        } else if (align === 'start') {
          top = targ.top;
        } else if (align === 'furthest-start') {
          top = targ.top - cont.height;
        } else if (align === 'furthest-end') {
          top = targ.top + targ.height;
        }
      } else if (dir === 'center') {
        left = this.windowWidth() - (cont.width / 2);
        top = this.windowHeight() - (cont.height / 2);
      }
    }

    return {
      left: Math.round(left),
      top: Math.round(top),
      width: Math.round(cont?.width || 0),
      height: Math.round(cont?.height || 0),
    };
  }

  isOutSideOfScreen(cont: Rect): { value: boolean, dir: any } {
    let width = this.windowWidth();
    let height = this.windowHeight();
    if (cont.left < 0) {
      return { value: true, dir: 'left' };
    } else if (cont.left + cont.width > width) {
      return { value: true, dir: 'right' };
    } else if (cont.top < 0) {
      return { value: true, dir: 'top' };
    } else if (cont.top + cont.height > height) {
      return { value: true, dir: 'bottom' };
    } else {
      return { value: false, dir: null };
    }
  }

  calculateOverlayPosition() {
    let pos = this.getRectByDirectionAndAlignment();
    let outScreen = this.isOutSideOfScreen(pos);

    let res = {
      direction: this.direction(),
      alignment: this.alignment(),
      pos: pos,
      failedDir: [],
      working: true
    };

    if (outScreen.value === false) {
      return res;
    } else {
      let newDirectionOrder: Array<Direction> = [];
      let newAlignmentOrder: Array<Alignment> = ['center', 'start', 'end', 'furthest-start', 'furthest-end'];
      if (res.direction === 'left') {
        newDirectionOrder = ['left', 'right', 'top', 'bottom', 'center'];
      } else if (res.direction === 'right') {
        newDirectionOrder = ['right', 'left', 'top', 'bottom', 'center'];
      } else if (res.direction === 'top') {
        newDirectionOrder = ['top', 'bottom', 'left', 'right', 'center'];
      } else if (res.direction === 'bottom') {
        newDirectionOrder = ['bottom', 'top', 'left', 'right', 'center'];
      }

      for (let i = 0; i < newDirectionOrder.length; i++) {
        const dir = newDirectionOrder[i];
        for (let j = 0; j < newAlignmentOrder.length; j++) {
          const align = newAlignmentOrder[j];
          pos = this.getRectByDirectionAndAlignment(dir, align);
          outScreen = this.isOutSideOfScreen(pos);
          if (outScreen.value === false) {
            res.direction = dir;
            res.alignment = align;
            res.pos = pos;
            return res;
          }
        }
      }
      res.working = false;
      return res;
    }
  }

  onEscapeKey(event: Event) {
    event.stopPropagation();
    this.hide();
  }

  /*onAnimationStart(event: AnimationEvent) {
    if (event.toState === 'visible') {
      const res = this.calculateOverlayPosition();
      if (res.working) {
        this.setContentAndArrowStyle(res.pos.left, res.pos.top, res.direction, res.alignment)
      } else {
        this.calculateForNotWorkingCase();
      }
    }
  }*/

  setContentAndArrowStyle(left: number, top: number, direction: Direction, alignment: Alignment) {
    this.containerStyle.set({
      'left': left + 'px',
      'top': top + 'px',
      'margin': '0'
    } as any);
  }

  calculateForNotWorkingCase() {
    let width = this.windowWidth();
    let height = this.windowHeight();
    const cont = this.getContainerDimension();
    let tx = '0';
    let ty = '0';
    let containerStyle = {} as any;
    let arrowStyle = { 'display': 'none' };

    if (cont && cont?.width > width) {
      containerStyle.width = '96vw';
      containerStyle.left = '2vw';
      containerStyle['overflow-x'] = 'scroll';
    } else {
      containerStyle.left = '50%';
      tx = '-50%';
    }

    if (cont && cont?.height > height) {
      containerStyle.height = '96vh';
      containerStyle.top = '2vh';
      containerStyle['overflow-y'] = 'scroll';
    } else {
      containerStyle.top = '50%';
      ty = '-50%';
    }

    containerStyle.transform = `translate(${tx},${ty})`;

    this.containerStyle.set(containerStyle);
  }

  onAnimationDone(event: AnimationEvent) {

  }

  setTarget(value: any) {
    this.target.apply(value);
  }
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

type Alignment = 'center' | 'start' | 'end' | 'furthest-start' | 'furthest-end';
type Direction = 'left' | 'top' | 'right' | 'bottom' | 'center';