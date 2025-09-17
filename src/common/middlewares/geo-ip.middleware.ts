import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as geoip from 'geoip-lite';

const BLOCKED_COUNTRIES = ['RU'];

@Injectable()
export class GeoIPMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const ip = req['clientIp'];
    const geo = geoip.lookup(ip || '');
    const countryCode = geo?.country;

    if (ip === '127.0.0.1' || ip === '::1') {
      return next();
    }
    console.log('Detected IP:', ip, 'Geo:', geo?.country);

    if (!countryCode || BLOCKED_COUNTRIES.includes(countryCode)) {
      throw new ForbiddenException({
        title: 'Access Denied',
        message: 'Unfortunately, this service is not available in your region.',
      });
    }
    next();
  }
}
