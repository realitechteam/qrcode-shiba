import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseAdminService.name);

    constructor(private readonly configService: ConfigService) {}

    onModuleInit() {
        if (admin.apps.length > 0) {
            return;
        }

        const projectId = this.configService.get<string>("FIREBASE_PROJECT_ID");

        if (!projectId) {
            this.logger.warn(
                "FIREBASE_PROJECT_ID not configured. Firebase token verification will not work."
            );
            return;
        }

        const clientEmail = this.configService.get<string>("FIREBASE_CLIENT_EMAIL");
        const privateKey = this.configService.get<string>("FIREBASE_PRIVATE_KEY");

        if (clientEmail && privateKey) {
            // Full credentials — enables all Firebase Admin features
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, "\n"),
                }),
            });
            this.logger.log("Firebase Admin SDK initialized with service account");
        } else {
            // Project ID only — sufficient for verifyIdToken()
            // Token verification uses Google's public keys, no service account needed
            admin.initializeApp({ projectId });
            this.logger.log("Firebase Admin SDK initialized with project ID only (token verification mode)");
        }
    }

    async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
        if (admin.apps.length === 0) {
            throw new Error("Firebase Admin SDK not initialized — set FIREBASE_PROJECT_ID env var");
        }
        return admin.auth().verifyIdToken(idToken);
    }
}
