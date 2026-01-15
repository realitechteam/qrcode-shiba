import { Request, Response } from "express";
import { RedirectService } from "./redirect.service";
import { TrackingService } from "./tracking.service";
export declare class RedirectController {
    private readonly redirectService;
    private readonly trackingService;
    constructor(redirectService: RedirectService, trackingService: TrackingService);
    /**
     * Handle QR code scan redirect
     * Main endpoint: GET /:shortCode
     */
    redirect(shortCode: string, req: Request, res: Response): Promise<any>;
    /**
     * Health check endpoint
     */
    health(): {
        status: string;
        service: string;
    };
    /**
     * Get client IP from request (handle proxies)
     */
    private getClientIp;
}
//# sourceMappingURL=redirect.controller.d.ts.map