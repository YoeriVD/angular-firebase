import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged, filter } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-firebase';
  items$: Observable<any>;
  range = new FormControl();
  constructor(private fire: AngularFirestore) {
    this.items$ = this.fire
      .collection('autos')
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
    const slider1$ = this.fire.collection('sliders').doc('slider1');
    slider1$
      .valueChanges()
      .pipe(
        filter(item => !!item),
        map(item => (item as any).value)
      )
      .subscribe(v => this.range.setValue(v));
    this.range.valueChanges.pipe(distinctUntilChanged()).subscribe(value =>
      slider1$.set({
        value: value
      })
    );
  }

  add(value: any) {
    this.fire.collection('autos').add({
      merk: value
    });
  }

  delete(id) {
    this.fire
      .collection('autos')
      .doc(id)
      .delete();
  }
}
