import { Pipe, PipeTransform } from '@angular/core';
import { Role, IssuedMandate } from '../models';

@Pipe({
  name: 'filterStatus',
  pure: false
})

export class FilterStatusPipe implements PipeTransform {
  transform(mandate: IssuedMandate) {
    if (mandate.type === 'mandate') {
        if (!mandate.status) {
            return 'Active';
        } else {
            return 'Revoked';
        }
    } else if (mandate.type === 'invite') {
      return 'Pending';
    }
    return 'Unknown';
  }
}
