import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { AuthProvider } from "@qrcode-shiba/database";

const logger = new Logger("GoogleStrategy");

/**
 * Returns GoogleStrategy class only if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 * If not configured, returns null and the module should skip registering it.
 */
export function createGoogleStrategyProvider() {
    return {
        provide: "GOOGLE_STRATEGY",
        useFactory: (configService: ConfigService, authService: AuthService) => {
            const clientID = configService.get<string>("GOOGLE_CLIENT_ID");
            const clientSecret = configService.get<string>("GOOGLE_CLIENT_SECRET");

            if (!clientID || !clientSecret) {
                logger.warn(
                    "Google OAuth not configured — GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required. " +
                    "Google login will be unavailable."
                );
                return null;
            }

            // Return an instance of the strategy (Passport auto-registers on instantiation)
            return new GoogleStrategyImpl(configService, authService);
        },
        inject: [ConfigService, AuthService],
    };
}

@Injectable()
export class GoogleStrategyImpl extends PassportStrategy(Strategy, "google") {
    constructor(
        configService: ConfigService,
        private authService: AuthService
    ) {
        super({
            clientID: configService.get<string>("GOOGLE_CLIENT_ID"),
            clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET"),
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
