/* removes owner from responses */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {EnvSettings} from 'config';
import {ConfigService} from 'config';
import {sanitizeUserEmail} from './user-sanitizer';

@Injectable()
export class DemoModeInterceptor implements NestInterceptor {
  private env: EnvSettings;
  constructor(private configService: ConfigService) {
    this.env = this.configService.getEnvSettings();
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.env.DemoMode) {
      return next.handle();
    }
    const email = context.switchToHttp().getRequest().user.email;
    return next.handle().pipe(map(removeOwnerNested.bind(null, email)));
  }
}

function removeOwnerNested(user: string, item: any): any {
  if (Array.isArray(item)) {
    return item.map(removeOwnerNested.bind(null, user));
  }
  if (typeof item === 'object') {
    if (item.owner) {
      item.owner = item.owner === user ? user : sanitizeUserEmail(item.owner);
    }

    for (const key of Object.keys(item)) {
      if (typeof item === 'object') {
        item[key] = removeOwnerNested(user, item[key]);
      }
    }
  }
  return item;
}
