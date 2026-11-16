import "server-only";

import { cache } from "react";
import { PaymentMethodsService } from "../services/payment-methods.service";

export const getPaymentMethods = cache(() => PaymentMethodsService.getAll());
