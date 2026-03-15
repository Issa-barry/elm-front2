export interface NotificationData {
  type: 'rupture_stock' | string;
  produit_id: number;
  nom: string;
  code: string;
  qte_stock: number;
  statut: string;
  message: string;
  date: string;
}

export interface ApiNotification {
  id: string;
  type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
}
