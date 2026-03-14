export type BillingEventStatus = 'pending' | 'invoiced' | 'paid' | 'cancelled';

export interface BillingEventOrganisationForfait {
  id: number;
  slug: string;
  nom: string;
}

export interface BillingEventOrganisation {
  id: number;
  nom: string;
  code: string;
  forfait?: BillingEventOrganisationForfait | null;
}

export interface BillingEventUser {
  id: number;
  nom_complet: string;
  reference: string;
}

export interface BillingEvent {
  id: number;
  organisation_id: number;
  user_id: number;
  event_type: string;
  unit_price: string;
  quantity: number;
  amount: string;
  status: BillingEventStatus;
  status_label: string;
  occurred_at: string;
  created_at: string;
  organisation: BillingEventOrganisation;
  user: BillingEventUser;
}

export interface BillingEventsFilter {
  organisation_id?: number;
  status?: BillingEventStatus;
  forfait?: string;
}
