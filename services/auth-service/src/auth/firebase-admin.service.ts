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
        const clientEmail = this.configService.get<string>("FIREBASE_CLIENT_EMAIL");
        const privateKey = this.configService.get<string>("FIREBASE_PRIVATE_KEY");

        if (!projectId || !clientEmail || !privateKey) {
            this.logger.warn(
                "Firebase Admin SDK credentials not configured. " +
                "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY env vars."
            );
            return;
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, "\n"),
            }),
        });

        this.logger.log("Firebase Admin SDK initialized");
    }

    async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
        if (admin.apps.length === 0) {
            throw new Error("Firebase Admin SDK not initialized");
        }
        return admin.auth().verifyIdToken(idToken);
    }
}
