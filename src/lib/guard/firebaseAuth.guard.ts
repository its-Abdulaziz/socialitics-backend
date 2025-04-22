import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { FirebaseService } from "../plugin/firebase/firebase.service";
import { NO_AUTH_KEY } from "../decorators/no-auth.decorator";
import { Reflector } from "@nestjs/core";
import * as admin from 'firebase-admin';
import { DataSource } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {

    constructor(       
        private readonly firebaseService: FirebaseService,
        private reflector: Reflector,
        private readonly dataSource: DataSource,

    ) {}
        
   async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const tokenHeader = request.headers.authorization;
        const noAuth = this.reflector.get<boolean>(
            NO_AUTH_KEY,
            context.getHandler(),
            );
            if (noAuth) 
                return true;
        if (!tokenHeader) {
            throw new UnauthorizedException();
        }
        let token = '';
        if (tokenHeader.startsWith('Bearer')) {
            const tokenArray = tokenHeader.split(' ');
            token = tokenArray[1];
        } else {
            token = tokenHeader;
        }
        const stage = process.env.STAGE;
        const nonProduction = stage == 'dev' || stage == 'local' || stage == 'staging';

        if (nonProduction && token == 'test') {
            request.token = token;
            if (!request.currentUser) {
                request.currentUser = {};
            }
            request.currentUser.firebaseUID = 'VpJOUX05QSh86FNf44Gb4jGYEF02';
        return true;
        }

        try {
            const app = this.firebaseService.getOrInitializeApp();
            const decodedToken = await admin.auth(app).verifyIdToken(token);
            request.firebaseUser = decodedToken;

            const firebaseUID = decodedToken.uid;
            const userRepo = this.dataSource.getRepository(User);
            const currentUser = await userRepo.findOne({
                where: { firebaseUID: firebaseUID },
            });

            if (currentUser) {
                request.currentUser = currentUser;
            } 
            else {
                throw new HttpException('user not exists', HttpStatus.BAD_REQUEST);
            }

            return true;
        } catch (err) {
        console.log('error:');
        console.log(err);
        const message = err.message ? err.message : '';
        const errTitle = err.error ? err.error : 'error';

        throw new UnauthorizedException(message, errTitle);
        }

    }

}