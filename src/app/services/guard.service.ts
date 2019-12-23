import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable()
export class Guard implements CanActivate {

  constructor(private router: Router, private storage: StorageService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean>|boolean {
    return new Promise((resolve, reject) => {
      const page = route.queryParams['page'];

      if (!page || page === 'popup') {
        const index = route.queryParams['index'];
        //console.log(index);
        let accessAllowed = false;
        this.storage.get('databases').then((databases) => {
          if (databases && databases[index]) {
            //console.log(databases[index]);
            StorageService.saveTmp({
              firebase_config: databases[index].config,
              database_index: index
            });
            accessAllowed = true;
          }
        }).catch((error) => {
          console.error(error.message);
        }).finally(() => {
          if (accessAllowed) {
            //console.log('access allowed');
            resolve(true);
          } else {
            //console.log('access denied');
            this.router.navigate(['/manager']);
            resolve(false);
          }
        });
      } else {
        this.router.navigate(['/' + page]);
        resolve(false);
      }
    });
  }

}
