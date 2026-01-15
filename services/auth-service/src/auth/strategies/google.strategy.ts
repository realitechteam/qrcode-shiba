import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { AuthProvider } from "@qrcode-shiba/database";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor(
        configService: ConfigService,
        private authService: AuthService
    ) {
        super({
            clientID: configService.get<string>("GOOGLE_CLIENT_ID") || "placeholder-client-id",
            clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET") || "placeholder-client-secret",
            callbackURL: configService.get<string>("GOOGLE_CALLBACK_URL") || "http://localhost:3001/api/v1/auth/google/callback",
            scope: ["email", "profile"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) {
        const { emails, displayName, id } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
            done(new Error("No email found in Google profile"), undefined);
            return;
        }

        const user = await this.authService.validateOAuthUser(
            email,
            displayName,
            id,
            AuthProvider.GOOGLE
        );

        done(null, user);
    }
}
