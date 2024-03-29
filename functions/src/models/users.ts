import {
    HLHorseServiceType,
    HLPlatformType,
    HLStripeAccountBusinessType,
    HLStripeCardBrand,
    HLStripeExternalAccountType,
    HLUserOnlineStatus,
    HLUserType
} from "../enumerations";

export class HLBaseUserModel {
    userId: string;
    name: string;
    avatarUrl?: string;
    phone: string;
    location?: string;
    createdAt: Date;

    constructor(data: any) {
        this.userId = data.userId;
        this.name = data.name;
        this.avatarUrl = data.avatarUrl;
        this.phone = data.phone;
        this.location = data.location;
        if (data.createdAt) {
            this.createdAt = new Date(data.createdAt);
        } else {
            this.createdAt = new Date();
        }
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this, {
            createdAt: this.createdAt.getTime()
        });
        return JSON.parse(JSON.stringify(dicObject));
    }

    subName(index: number) {
        if (undefined === this.name) { return undefined; }

        const subNames = this.name.split(' ');
        if (index < subNames.length) {
            return subNames[index];
        }

        return undefined;
    }

    update(data: HLBaseUserModel) {
        this.name = data.name;
        this.phone = data.phone;
        this.avatarUrl = data.avatarUrl
    }
}

class HLStripeExternalAccountModel {
    object: HLStripeExternalAccountType;
    id: string;
    country: string;
    currency: string;
    last4: string;
    defaultForCurrency: boolean;

    // bank
    bankName: string;
    routingNumber: string;

    // card
    brand: HLStripeCardBrand;
    expMonth: number;
    expYear: number;

    constructor(data: any, isStripeData: boolean = false) {
        this.object = data.object;
        this.id = data.id;
        this.country = data.country;
        this.currency = data.currency;
        this.last4 = data.last4;
        if (isStripeData) {
            this.defaultForCurrency = data.default_for_currency;

            // bank
            this.bankName = data.bank_name;
            this.routingNumber = data.routing_number;

            // card
            this.brand = data.brand;
            this.expMonth = data.exp_month;
            this.expYear = data.exp_year;
        } else {
            this.defaultForCurrency = data.defaultForCurrency;

            // bank
            this.bankName = data.bankName;
            this.routingNumber = data.routingNumber;

            // card
            this.brand = data.brand;
            this.expMonth = data.expMonth;
            this.expYear = data.expYear;
        }
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this);
        return JSON.parse(JSON.stringify(dicObject));
    }
}

export class HLStripeAccountModel {
    id: string;
    businessType?: HLStripeAccountBusinessType;
    email?: string;
    country: string;
    externalAccounts?: HLStripeExternalAccountModel[];

    constructor(data: any, isStripeData: boolean = false) {
        this.id = data.id;
        if (isStripeData) {
            this.businessType = data.business_type;
            if (data.external_accounts) {
                this.externalAccounts = data.external_accounts.data.map((value: any) => new HLStripeExternalAccountModel(value, isStripeData));
            }
        } else {
            this.businessType = data.businessType;
            this.externalAccounts = data.externalAccounts.map((value: any) => new HLStripeExternalAccountModel(value, isStripeData));
        }
        this.email = data.email;
        this.country = data.country;
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this, {
            externalAccounts: this.externalAccounts ? this.externalAccounts.map(value => value.toJSON()) : undefined
        });

        return JSON.parse(JSON.stringify(dicObject));
    }

}

export class HLServiceProviderModel extends HLBaseUserModel {
    // stripe account
    account?: HLStripeAccountModel;

    constructor(data: any) {
        super(data);

        if (data.account) {
            this.account = new HLStripeAccountModel(data.account);
        }
    }

    toJSON(needPaymentInformation: boolean = true): {} {
        const dicObject = Object.assign({}, this, {
            account: (this.account && needPaymentInformation) ? this.account.toJSON() : undefined,
            createdAt: this.createdAt.getTime()
        });
        return JSON.parse(JSON.stringify(dicObject));
    }
}

class HLStripeCardModel {
    id: string;
    brand: HLStripeCardBrand;
    last4: string;
    expMonth: number;
    expYear: number;

    constructor(data: any, isStripeData: boolean = false) {
        this.id = data.id;
        this.brand = data.brand;
        this.last4 = data.last4;
        if (isStripeData) {
            this.expMonth = data.exp_month;
            this.expYear = data.exp_year;
        } else {
            this.expMonth = data.expMonth;
            this.expYear = data.expYear;
        }
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this);
        return JSON.parse(JSON.stringify(dicObject));
    }
}

export class HLStripeCustomerModel {
    id: string;
    defaultSource: string | null;
    description?: string;
    email?: string;
    name?: string;
    phone?: string;
    cards?: HLStripeCardModel[];

    constructor(data: any, isStripeData: boolean = false) {
        this.id = data.id;
        if (isStripeData) {
            this.defaultSource = data.default_source;
            if (data.sources) {
                this.cards = data.sources.data.map((value: any) => new HLStripeCardModel(value, isStripeData));
            }
        } else {
            this.defaultSource = data.defaultSource;
            this.cards = data.cards.map((value: any) => new HLStripeCardModel(value, isStripeData));
        }

        this.description = data.description;
        this.email = data.email;
        this.name = data.name;
        this.phone = data.phone;
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this, {
            cards: this.cards ? this.cards.map(value => value.toJSON()) : undefined
        });

        return JSON.parse(JSON.stringify(dicObject));
    }
}

export class HLHorseManagerModel extends HLBaseUserModel {
    barnName: string;
    providerIds?: string[];
    percentage?: number;

    // stripe customer
    customer?: HLStripeCustomerModel;

    constructor(data: any) {
        super(data);

        this.barnName = data.barnName;
        this.percentage = data.percentage;
        if (data.customer) {
            this.customer = new HLStripeCustomerModel(data.customer);
        }
    }

    toJSON(needPaymentInformation: boolean = true): {} {
        const dicObject = Object.assign({}, this, {
            customer: (this.customer && needPaymentInformation) ? this.customer.toJSON() : undefined,
            createdAt: this.createdAt.getTime()
        });
        return JSON.parse(JSON.stringify(dicObject));
    }
}

export class HLUserModel {
    uid: string;
    email: string;
    serviceProvider?: HLServiceProviderModel;
    horseManager?: HLHorseManagerModel;
    token?: string;
    status: HLUserOnlineStatus;
    type?: HLUserType;
    platform: HLPlatformType;
    createdAt: Date;

    constructor(uid: string, data: any) {
        this.uid = uid;
        this.email = data.email;

        if (data.horseManager) {
            this.horseManager = new HLHorseManagerModel(data.horseManager);
        }
        if (data.serviceProvider) {
            this.serviceProvider = new HLServiceProviderModel(data.serviceProvider);
        }

        this.token = data.token;
        this.status = data.status;
        this.type = data.type;
        this.platform = data.platform;
        if (data.createdAt) {
            this.createdAt = new Date(data.createdAt);
        } else {
            this.createdAt = new Date();
        }
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this, {
            serviceProvider: this.serviceProvider ? this.serviceProvider.toJSON() : undefined,
            horseManager: this.horseManager ? this.horseManager.toJSON() : undefined,
            createdAt: this.createdAt.getTime()
        });
        return JSON.parse(JSON.stringify(dicObject));
    }
}

export class HLListenerUserModel {
    userId: string;
    userType: HLUserType;

    constructor(data: any) {
        this.userId = data.userId;
        this.userType = data.userType;
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this);
        return JSON.parse(JSON.stringify(dicObject));
    }
}

export class HLHorseManagerPaymentApproverModel extends HLHorseManagerModel {
    uid: string;
    creatorId: string;

    // if null, it means unlimited
    amount: number | null;

    constructor(uid: string, data: any) {
        super(data);
        this.uid = uid;
        this.creatorId = data.creatorId;
        this.amount = data.amount;
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this, {
            createdAt: this.createdAt.getTime()
        });
        return JSON.parse(JSON.stringify(dicObject));
    }
}

export class HLHorseManagerProviderModel extends HLServiceProviderModel {
    uid: string;
    creatorId: string;
    serviceType: HLHorseServiceType;

    constructor(uid: string, data: any) {
        super(data);
        this.uid = uid;
        this.creatorId = data.creatorId;
        this.serviceType = data.serviceType;
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this, {
            createdAt: this.createdAt.getTime()
        });
        return JSON.parse(JSON.stringify(dicObject));
    }
}

export class HLServiceProviderServiceModel {
    uid: string;
    userId: string;
    service: string;
    rate: number;
    quantity?: number;

    constructor(uid: string, data: any) {
        this.uid = uid;
        this.userId = data.userId;
        this.service = data.service;
        this.rate = data.rate;
        this.quantity = data.quantity;
    }

    toJSON(): {} {
        const dicObject = Object.assign({}, this);
        return JSON.parse(JSON.stringify(dicObject));
    }
}