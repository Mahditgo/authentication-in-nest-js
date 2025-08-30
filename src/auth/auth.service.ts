import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly databaseSercie : DatabaseService,
        private readonly jwtService : JwtService
    ) {}

    async register(email : string, password : string, name ?: string) {
        const hashedePasseword = await bcrypt.hash(password, 10);
        const user = await this.databaseSercie.user.create({
            data : {
                email,
                password : hashedePasseword,
                name
            }
        });

        return user
    }

    async login (email : string, password : string) {
        const user = await this.databaseSercie.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: user.id, email: user.email };
        const token = await this.jwtService.signAsync(payload);

        return { access_token: token };
    }

    async validateUser(userId: string) {
    return this.databaseSercie.user.findUnique({ where: { id: userId } });
  }
} 
