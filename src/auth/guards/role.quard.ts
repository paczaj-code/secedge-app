import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { User } from '../../entities/user.entity';
import { Reflector } from '@nestjs/core';
import { Role } from '../../enums/role.enum';
import { ROLE_KEY } from '../../decorators/role.decorator';

/**
 * The RoleGuard class is a guard that implements the CanActivate interface to
 * determine if a request has the necessary permissions to be processed. It uses
 * token authentication to verify the user's role and ensure it meets the required
 * role for accessing specific routes or performing certain actions.
 *
 * It works by extracting and verifying the authentication token from the request
 * header, determining the required role for the requested action using reflection,
 * and comparing the user's role from the decoded token to this requirement.
 *
 * The guard assumes the presence of a ROLE_KEY key that stores the required roles and
 * uses the Reflection API to retrieve these roles, in conjunction with AuthService to
 * validate tokens.
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  /**
   * Determines if a request is authorized based on the presence and validity of a token,
   * and whether the token's associated role has sufficient privileges.
   *
   * @param {ExecutionContext} context - The execution context which provides details about the
   * current request being processed, allowing extraction of the HTTP request.
   *
   * @return {boolean | Promise<boolean> | Observable<boolean>} Returns a boolean indicating if the
   * access is granted or denied. It may also return a Promise or Observable that resolves to a boolean
   * value, which facilitates asynchronous operations.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) return false;

    const decodedToken = this.verifyToken(token, request);
    if (!decodedToken) return false;

    const requiredRole = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])[0];

    return this.hasSufficientRole(decodedToken, requiredRole);
  }

  /**
   * Extracts the token from the authorization header in the given request object.
   *
   * @param request - The request object containing headers from which the token is to be extracted.
   * @return The extracted token as a string, or null if the authorization header is not present or improperly formatted.
   */
  private extractToken(request: any): string | null {
    return request.headers.authorization?.split(' ')[1] ?? null;
  }

  /**
   * Verifies the provided authentication token and attaches the decoded user information to the request object.
   *
   * @param token - The authentication token to be verified.
   * @param request - The request object to which the decoded user information will be attached.
   * @return A partial User object containing the decoded user information if the token is valid; otherwise, null.
   */
  private verifyToken(token: string, request: any): Partial<User> | null {
    try {
      const decoded = this.authService.verifyAccessToken(token);
      request.user = decoded;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Determines if the user represented by the decoded token has a sufficient role.
   *
   * @param {Partial<User>} decodedToken - The decoded user token containing role information.
   * @param {Role} requiredRole - The role required to access a specific resource or perform an action.
   * @return {boolean} True if the user's role meets or exceeds the required role, false otherwise.
   */
  private hasSufficientRole(
    decodedToken: Partial<User>,
    requiredRole: Role,
  ): boolean {
    return Role[decodedToken.role] >= Role[requiredRole];
  }
}
