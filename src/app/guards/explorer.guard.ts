import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { Database } from '../models/database.model';

@Injectable({
  providedIn: 'root'
})
export class ExplorerGuard implements CanActivate {

  protected pageName: string = 'popup';

  constructor(private router: Router, private storage: StorageService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean>|boolean {
    return new Promise((resolve, reject) => {
      const page = route.queryParams['page'];

      if (!page || page === this.pageName) {
        const index = route.queryParams['index'] || null;
        //console.log(index);
        let accessAllowed = false;
        this.storage.get('databases').then((databases: Database[]) => {
          if (databases && index && databases[index]) {
            //console.log(databases[index]);
            const database: Database = {
              index: index,
              config: databases[index].config,
              collections: databases[index].collections,
              authentication: databases[index].authentication || null
            };
            StorageService.setTmp('database', database);
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
