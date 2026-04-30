import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const header  = request.headers['authorization']
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Token requerido')

    try {
      const token   = header.slice(7)
      const decoded = jwt.verify(token, process.env.JWT_SECRET ?? '') as any
      request.user  = decoded
      return true
    } catch {
      throw new UnauthorizedException('Token inválido o expirado')
    }
  }
}
