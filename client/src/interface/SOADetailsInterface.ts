export interface SOADetails {
    id?:string;
    account_holder_name:string;
    account_type:string;
    billing_address:string;
    card_number:string;
    payment_due_date:string;
    statement_date:string
    minimum_payment_due:string;
    bank_name:string;
    credit_limit:string;
    statement_balance:string;
    previous_balance:string;
    paid?:boolean;
    added_to_calendar?:boolean;
}

export interface ListOfSOADetails {
    data:SOADetails;
}
export interface PieChartSOAData {
    data: { category: string; amount: number }[];
    ChartTitle:string;
}