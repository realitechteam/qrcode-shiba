import { Module, Global } from "@nestjs/common";
import { PaymentOrchestrationService } from "./payment-orchestration.service";

@Global()
@Module({
    providers: [PaymentOrchestrationService],
    exports: [PaymentOrchestrationService],
})
export class SharedModule { }
