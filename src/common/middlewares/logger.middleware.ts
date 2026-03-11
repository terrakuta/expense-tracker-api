import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ConsoleLogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const send = res.send;

    res.send = (body?: any) => {
      if (res.getHeader('content-type')?.toString().includes('application/json')) {
        const responseData = body ? body.toString().substring(0, 10_000) : undefined;
        const success = res.statusCode <= 299;

        console.log('--- Request Log ---');
        console.log('Method:', req.method);
        console.log('URL:', req.originalUrl);
        console.log('Status:', res.statusCode);
        console.log('Success:', success);
        console.log('Response (truncated):', responseData);
        console.log('------------------');
      }

      res.send = send;
      return res.send(body);
    };

    next();
  }
}
