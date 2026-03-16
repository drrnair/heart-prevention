import { Platform } from "react-native";

interface Product {
  readonly title: string;
  readonly description: string;
  readonly priceString: string;
  readonly price: number;
}

interface Package {
  readonly identifier: string;
  readonly product: Product;
  readonly packageType: "MONTHLY" | "ANNUAL";
}

interface Offerings {
  readonly current: {
    readonly monthly: Package | null;
    readonly annual: Package | null;
  } | null;
}

interface PurchaseResult {
  readonly receipt: string;
}

interface RestoreResult {
  readonly activeEntitlements: readonly string[];
}

const MOCK_OFFERINGS: Offerings = {
  current: {
    monthly: {
      identifier: "hp_monthly_499",
      product: {
        title: "HeartPrevention Monthly",
        description: "Full access to all premium features, billed monthly.",
        priceString: "$4.99",
        price: 4.99,
      },
      packageType: "MONTHLY",
    },
    annual: {
      identifier: "hp_annual_3999",
      product: {
        title: "HeartPrevention Annual",
        description:
          "Full access to all premium features, billed annually. Save 33%.",
        priceString: "$39.99",
        price: 39.99,
      },
      packageType: "ANNUAL",
    },
  },
};

// TODO: Replace with Purchases.configure(apiKey) from @revenuecat/purchases-react-native
export async function configure(): Promise<void> {
  const _platform = Platform.OS;
  // TODO: Call Purchases.configure({ apiKey: platform === 'ios' ? IOS_KEY : ANDROID_KEY })
}

// TODO: Replace with Purchases.logIn(userId) from @revenuecat/purchases-react-native
export async function identify(_userId: string): Promise<void> {
  // TODO: Call Purchases.logIn(userId)
}

// TODO: Replace with Purchases.getOfferings() from @revenuecat/purchases-react-native
export async function getOfferings(): Promise<Offerings> {
  // TODO: Return real offerings from Purchases.getOfferings()
  return MOCK_OFFERINGS;
}

// TODO: Replace with Purchases.purchasePackage(pkg) from @revenuecat/purchases-react-native
export async function purchasePackage(_pkg: Package): Promise<PurchaseResult> {
  // TODO: Call Purchases.purchasePackage(pkg) and return the actual receipt
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { receipt: `mock_receipt_${Date.now()}_${_pkg.identifier}` };
}

// TODO: Replace with Purchases.restorePurchases() from @revenuecat/purchases-react-native
export async function restorePurchases(): Promise<RestoreResult> {
  // TODO: Call Purchases.restorePurchases() and return real entitlements
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { activeEntitlements: [] };
}

export type { Package, Offerings, PurchaseResult, RestoreResult };
