import { InviteComponent } from './invite.component';
import { MockActivatedRoute } from '../../../../testing/mockActivatedRoute';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { ParamMap } from '@angular/router';


describe('Invite component', () => {
  let mockRolesClient;
  let mockTranslateService;
  let mockSessionService;
  let component: InviteComponent;
  const fakeRoles = [{name: 'Admin', description: 'Admin dude'}];

  beforeEach(() => {
    const route = new MockActivatedRoute();
    const mockParamMap: ParamMap = {
      get(): string { return ''; },
      getAll() { return []; },
      has(name: string): boolean { return true; },
      keys: []
    };
    route.paramMap = Observable.of(mockParamMap);

    mockRolesClient = {
      getRole(role, roleId) {
        return '';
      },
      getRoles() {
        return new Promise((resolve, reject) => {
          resolve(fakeRoles);
        });
      }
    };
    mockTranslateService = {
      instant() {
        return '';
      }
    };
    mockSessionService = {};

    component = new InviteComponent(null, route, mockSessionService, mockRolesClient, null, mockTranslateService);
    component.ngOnInit();
  });

  it('should not retrieve role when no role ID has been specified', () => {
    spyOn(mockRolesClient, 'getRole');
    expect(mockRolesClient.getRole).not.toHaveBeenCalled();
  });
});
